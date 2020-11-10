// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createSingleMessage, isDiagnosticWithInRange } from '@bfc/indexers';
import { Diagnostic, DialogInfo, LuFile, LgFile, LgNamePattern } from '@bfc/shared';
import get from 'lodash/get';

import { getBaseName } from '../../utils/fileUtil';
import { replaceDialogDiagnosticLabel } from '../../utils/dialogUtil';
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
  botName: string;
  id: string;
  severity: string;
  type: DiagnosticType;
  location: string;
  message: string;
  diagnostic: any;
  dialogPath?: string; //the data path in dialog
  resourceId: string; // id without locale
}

export abstract class DiagnosticInfo implements IDiagnosticInfo {
  projectId: string;
  botName: string;
  id: string;
  severity: string;
  type = DiagnosticType.GENERAL;
  location: string;
  message = '';
  diagnostic: Diagnostic;
  dialogPath?: string;
  resourceId: string;
  constructor(projectId: string, botName: string, id: string, location: string, diagnostic: Diagnostic) {
    this.projectId = projectId;
    this.botName = botName;
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
}

export class DialogDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.DIALOG;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
}

export class SkillDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SKILL;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
}

export class SettingDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.SETTING;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.message = `${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
}

export class LgDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.LG;
  constructor(
    projectId: string,
    botName: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    lgFile: LgFile,
    dialogs: DialogInfo[]
  ) {
    super(projectId, botName, id, location, diagnostic);
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
}

export class LuDiagnostic extends DiagnosticInfo {
  type = DiagnosticType.LU;
  constructor(
    projectId: string,
    botName: string,
    id: string,
    location: string,
    diagnostic: Diagnostic,
    luFile: LuFile,
    dialogs: DialogInfo[]
  ) {
    super(projectId, botName, id, location, diagnostic);
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
}

export class QnADiagnostic extends DiagnosticInfo {
  type = DiagnosticType.QNA;
  constructor(projectId: string, id: string, location: string, diagnostic: Diagnostic) {
    super(projectId, id, location, diagnostic);
    this.dialogPath = '';
    this.message = createSingleMessage(diagnostic);
  }
}
