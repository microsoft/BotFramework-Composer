// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createSingleMessage, isDiagnosticWithInRange } from '@bfc/indexers';
import { Diagnostic, DialogInfo, LuFile, LgFile, LgNamePattern } from '@bfc/shared';
import get from 'lodash/get';

import { getBaseName } from '../../utils/fileUtil';
import { replaceDialogDiagnosticLabel } from '../../utils/dialogUtil';
import { convertPathToUrl } from '../../utils/navigation';
export const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'

export enum DiagnosticType {
  DIALOG,
  LG,
  LU,
  QNA,
  SKILL,
  SETTING,
  GENERAL,
}

export interface IDiagnosticInfo {
  projectId: string;
  id: string;
  severity: string;
  type: DiagnosticType;
  location: string;
  message: string;
  diagnostic: any;
  dialogPath?: string; //the data path in dialog
  resourceId: string; // id without locale
  getUrl: (projectId: string) => string;
}

export abstract class DiagnosticInfo implements IDiagnosticInfo {
  projectId: string;
  id: string;
  severity: string;
  type = DiagnosticType.GENERAL;
  location: string;
  message = '';
  diagnostic: Diagnostic;
  dialogPath?: string;
  resourceId: string;
  getUrl = (projectId: string) => '';

  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    this.projectId = projectId;
    this.id = id;
    this.resourceId = getBaseName(id);
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.diagnostic = diagnostic;
    this.location = location;
  }
}

export class ServerDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.GENERAL;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = diagnostic.message;
  }

  getUrl = () => '';
}

export class DialogDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.DIALOG;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }

  getUrl = (rootProjectId: string) => {
    //path is like main.trigers[0].actions[0]
    //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
    const { projectId, id, dialogPath = '' } = this;
    return convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, id, dialogPath);
  };
}

export class SkillDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SKILL;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
  getUrl = (rootProjectId: string) => {
    return `/bot/${rootProjectId}/skills`;
  };
}

export class SettingDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SETTING;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
  getUrl = (rootProjectId: string) => {
    return `/settings/bot/${rootProjectId}/dialog-settings`;
  };
}

export class LgDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.LG;
  constructor(
    projectId: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    lgFile: LgFile,
    dialogs: DialogInfo[]
  ) {
    super(projectId, id, location, diagnostic);
    this.message = createSingleMessage(diagnostic);
    this.dialogPath = this.findDialogPath(lgFile, dialogs, diagnostic);
  }
  private findDialogPath(lgFile: LgFile, dialogs: DialogInfo[], diagnostic: Diagnostic) {
    const mappedTemplate = lgFile.templates.find(
      (t) =>
        get(diagnostic, 'range.start.line') >= get(t, 'range.start.line') &&
        get(diagnostic, 'range.end.line') <= get(t, 'range.end.line')
    );
    if (mappedTemplate && mappedTemplate.name.match(LgNamePattern)) {
      //should navigate to design page
      const lgTemplateName = mappedTemplate.name;
      const dialog = dialogs.find((d) => d.lgFile === this.resourceId);
      const lgTemplate = dialog ? dialog.lgTemplates.find((lg) => lg.name === lgTemplateName) : null;
      const path = lgTemplate ? lgTemplate.path : '';
      return path;
    }
  }

  getUrl = (rootProjectId: string) => {
    const { projectId, resourceId, diagnostic, dialogPath } = this;
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
    projectId: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    luFile: LuFile,
    dialogs: DialogInfo[]
  ) {
    super(projectId, id, location, diagnostic);
    this.dialogPath = this.findDialogPath(luFile, dialogs, diagnostic);
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

  getUrl = (rootProjectId: string) => {
    const { projectId, resourceId, diagnostic, dialogPath } = this;
    let uri = `/bot/${projectId}/language-understanding/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
    if (dialogPath) {
      uri = convertPathToUrl(rootProjectId, rootProjectId === projectId ? null : projectId, resourceId, dialogPath);
    }
    return uri;
  };
}

export class QnADiagnostic extends DiagnosticInfo {
  type = DiagnosticType.QNA;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.dialogPath = '';
    this.message = createSingleMessage(diagnostic);
  }

  getUrl = (rootProjectId: string) => {
    const { resourceId, diagnostic } = this;
    return `/bot/${rootProjectId}/knowledge-base/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
  };
}
