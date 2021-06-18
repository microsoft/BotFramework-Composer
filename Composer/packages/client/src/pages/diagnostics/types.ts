// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createSingleMessage, isDiagnosticWithInRange } from '@bfc/indexers';
import { Diagnostic, DialogInfo, LuFile, LgFile, LgNamePattern, ITrigger } from '@bfc/shared';
import get from 'lodash/get';
import formatMessage from 'format-message';

import { getBaseName } from '../../utils/fileUtil';
import { replaceDialogDiagnosticLabel } from '../../utils/dialogUtil';
import { convertPathToUrl, createBotSettingUrl } from '../../utils/navigation';
export const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'

export enum DiagnosticType {
  DIALOG,
  LG,
  LU,
  QNA,
  SKILL,
  SETTING,
  GENERAL,
  SCHEMA,
}

export interface IDiagnosticInfo {
  rootProjectId: string;
  projectId: string;
  id: string;
  severity: string;
  type: DiagnosticType;
  location: string;
  message: string;
  diagnostic: any;
  dialogPath?: string; //the data path in dialog
  resourceId: string; // id without locale
  getUrl: (hash?: string) => string;
  learnMore?: string;
  title?: string;
  friendlyLocationPath?: string[];
}

export abstract class DiagnosticInfo implements IDiagnosticInfo {
  rootProjectId: string;
  projectId: string;
  id: string;
  severity: string;
  type = DiagnosticType.GENERAL;
  location: string;
  message = '';
  diagnostic: Diagnostic;
  dialogPath?: string;
  resourceId: string;
  getUrl = () => '';
  learnMore?: string;
  title?: string;

  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    this.rootProjectId = rootProjectId;
    this.projectId = projectId;
    this.id = id;
    this.resourceId = getBaseName(id);
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.diagnostic = diagnostic;
    this.location = location;
  }
}

export class BotDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.GENERAL;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = diagnostic.message;
  }

  getUrl = () => {
    let url = '';
    switch (this.location) {
      case 'manifest.json': {
        const { rootProjectId, projectId } = this;
        url = convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, null);
        break;
      }
    }
    return url;
  };
}

export class DialogDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.DIALOG;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }

  getUrl = () => {
    //path is like main.trigers[0].actions[0]
    //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
    const { rootProjectId, projectId, id, dialogPath = '' } = this;
    return convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, id, dialogPath);
  };
}

export class SchemaDiagnostic extends DialogDiagnostic {
  type = DiagnosticType.SCHEMA;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = diagnostic.message;
    this.title = formatMessage('Deactivated action.');
    this.learnMore = formatMessage('Learn more about custom actions');
  }
}

export class SkillSettingDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SKILL;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
  getUrl = () => {
    const { rootProjectId, projectId, id } = this;

    if (this.location === 'appsettings.json') {
      return createBotSettingUrl(rootProjectId, projectId);
    }

    return convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, id);
  };
}

export class SettingDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SETTING;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
  getUrl = (hash?: string) => {
    return createBotSettingUrl(this.rootProjectId, this.projectId, hash);
  };
}

export class LgDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.LG;
  constructor(
    rootProjectId: string,
    projectId: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    lgFile: LgFile,
    dialogs: DialogInfo[]
  ) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.message = createSingleMessage(diagnostic);
    this.dialogPath = this.findDialogPath(lgFile, dialogs, diagnostic);
    const friendlyPath = this.getFriendlyPath(this.dialogPath, dialogs);
    if (friendlyPath.length) {
      this.friendlyLocationPath = friendlyPath;
    }
  }
  private getFriendlyPath(dialogPath: string | undefined, dialogs: DialogInfo[]) {
    try {
      if (!dialogPath) {
        return [];
      }
      const breadcrumb: string[] = [];
      const [dialogName, triggerPath, actionPath] = dialogPath.split('.');
      if (dialogName) {
        const matchedDialog = dialogs.find(({ displayName }) => displayName === dialogName);
        if (matchedDialog && triggerPath) {
          breadcrumb.push(matchedDialog.displayName);

          const trigger: ITrigger = get(matchedDialog, triggerPath, '');
          if (trigger.displayName) {
            breadcrumb.push(trigger.displayName);
          }

          if (trigger && actionPath) {
            const action = get(trigger.content, actionPath, '');
            if (action.$kind) {
              breadcrumb.push(action.$kind);
            }
          }
        }
      }
      return breadcrumb;
    } catch (ex) {
      return [];
    }
  }

  private findDialogPath(lgFile: LgFile, dialogs: DialogInfo[], diagnostic: Diagnostic) {
    const mappedTemplate = lgFile.templates.find(
      (t) =>
        get(diagnostic, 'range.start.line') >= get(t, 'range.start.line') &&
        get(diagnostic, 'range.end.line') <= get(t, 'range.end.line')
    );
    if (mappedTemplate?.name?.match(LgNamePattern)) {
      //should navigate to design page
      const lgTemplateName = mappedTemplate.name;
      const dialog = dialogs.find((d) => d.lgFile === this.resourceId);
      const lgTemplate = dialog ? dialog.lgTemplates.find((lg) => lg.name === lgTemplateName) : null;
      const path = lgTemplate ? lgTemplate.path : '';

      return path;
    }
  }

  getUrl = () => {
    const { rootProjectId, projectId, resourceId, diagnostic, dialogPath } = this;
    let uri = `/bot/${rootProjectId}/language-generation/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
    //the format of item.id is lgFile#inlineTemplateId
    if (dialogPath) {
      uri = convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, resourceId, dialogPath);
    }

    return uri;
  };
}

export class LuDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.LU;
  constructor(
    rootProjectId: string,
    projectId: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    luFile: LuFile,
    dialogs: DialogInfo[]
  ) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.dialogPath = this.findDialogPath(luFile, dialogs, diagnostic);
    const splitPath = this.dialogPath?.split('.');
    console.log('LU', splitPath);

    this.message = createSingleMessage(diagnostic);
  }

  private findDialogPath(luFile: LuFile, dialogs: DialogInfo[], d: Diagnostic) {
    const intentName = luFile.intents.find((intent) => {
      const { range } = intent;
      if (!range) return false;
      return isDiagnosticWithInRange(d, range);
    })?.Name;

    return dialogs
      .find((dialog) => dialog.id === this.resourceId)
      ?.referredLuIntents.find((lu) => lu.name === intentName)?.path;
  }

  getUrl = () => {
    const { rootProjectId, projectId, resourceId, diagnostic, dialogPath } = this;
    let uri = `/bot/${projectId}/language-understanding/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
    if (dialogPath) {
      uri = convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, resourceId, dialogPath);
    }
    return uri;
  };
}

export class QnADiagnostic extends DiagnosticInfo {
  type = DiagnosticType.QNA;
  constructor(rootProjectId: string, projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(rootProjectId, projectId, id, location, diagnostic);
    this.dialogPath = '';
    this.message = createSingleMessage(diagnostic);
  }

  getUrl = () => {
    const { rootProjectId, resourceId, diagnostic } = this;
    return `/bot/${rootProjectId}/knowledge-base/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
  };
}
