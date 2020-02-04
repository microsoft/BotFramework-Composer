// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic, createSingleMessage, DialogInfo, LuFile } from '@bfc/indexers';

import { replaceDialogDiagnosticLabel } from '../../utils';

export const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'

export enum NotificationType {
  DIALOG,
  LG,
  LU,
}

export interface INotification {
  id: string;
  severity: string;
  type: NotificationType;
  location: string;
  message: string;
  diagnostic: any;
  dialogPath?: string; //the data path in dialog
}

export class DialogNotification implements INotification {
  id: string;
  severity: string;
  type: NotificationType;
  location: string;
  message: string;
  diagnostic: Diagnostic;
  dialogPath?: string;
  constructor(id: string, location: string, diagnostic: Diagnostic) {
    this.id = id;
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.message = `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.diagnostic = diagnostic;
    this.location = location;
    this.type = NotificationType.DIALOG;
    this.dialogPath = diagnostic.path;
  }
}

export class LgNotification implements INotification {
  id: string;
  severity: string;
  type: NotificationType;
  location: string;
  message: string;
  diagnostic: Diagnostic;
  dialogPath?: string;
  constructor(id: string, location: string, diagnostic: Diagnostic) {
    this.id = id;
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.message = createSingleMessage(diagnostic);
    this.diagnostic = diagnostic;
    this.location = location;
    this.type = NotificationType.LG;
  }
}

export class LuNotification implements INotification {
  id: string;
  severity: string;
  type: NotificationType;
  location: string;
  message: string;
  diagnostic: Diagnostic;
  dialogPath?: string;
  constructor(id: string, location: string, diagnostic: Diagnostic, luFile: LuFile, dialogs: DialogInfo[]) {
    this.id = id;
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.message = createSingleMessage(diagnostic);
    this.diagnostic = diagnostic;
    this.location = location;
    this.type = NotificationType.LU;
    this.dialogPath = this.findDialogPath(luFile, dialogs, diagnostic);
  }

  private findDialogPath(luFile: LuFile, dialogs: DialogInfo[], d: Diagnostic) {
    const intentName = luFile.intents.find(intent => {
      const { range } = intent;
      if (!range) return false;
      return d.range && d.range.start.line >= range.startLineNumber && d.range.end.line <= range.endLineNumber;
    })?.Name;

    return dialogs.find(dialog => dialog.id === luFile.id)?.referredLuIntents.find(lu => lu.name === intentName)?.path;
  }
}
