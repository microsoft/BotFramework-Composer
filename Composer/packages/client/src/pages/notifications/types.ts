// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createSingleMessage, isDiagnosticWithInRange } from '@bfc/indexers';
import { Diagnostic, DialogInfo, LuFile } from '@bfc/shared';

import { replaceDialogDiagnosticLabel } from '../../utils';
export const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'

export enum NotificationType {
  DIALOG,
  LG,
  LU,
  GENERAL,
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

export abstract class Notification implements INotification {
  id: string;
  severity: string;
  type = NotificationType.GENERAL;
  location: string;
  message = '';
  diagnostic: Diagnostic;
  dialogPath?: string;
  constructor(id: string, location: string, diagnostic: Diagnostic) {
    this.id = id;
    this.severity = DiagnosticSeverity[diagnostic.severity] || '';
    this.diagnostic = diagnostic;
    this.location = location;
  }
}

export class DialogNotification extends Notification {
  type = NotificationType.DIALOG;
  constructor(id: string, location: string, diagnostic: Diagnostic) {
    super(id, location, diagnostic);
    this.message = `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`;
    this.dialogPath = diagnostic.path;
  }
}

export class LgNotification extends Notification {
  type = NotificationType.LG;
  constructor(id: string, lgTemplateName: string, location: string, diagnostic: Diagnostic, dialogs: DialogInfo[]) {
    super(id, location, diagnostic);
    this.message = createSingleMessage(diagnostic);
    this.dialogPath = this.findDialogPath(dialogs, id, lgTemplateName);
  }
  private findDialogPath(dialogs: DialogInfo[], id: string, lgTemplateName: string) {
    if (lgTemplateName) {
      const dialog = dialogs.find(d => d.lgFile === id);
      const lgTemplate = dialog ? dialog.lgTemplates.find(lg => lg.name === lgTemplateName) : null;
      const path = lgTemplate ? lgTemplate.path : '';
      return path;
    }
  }
}

export class LuNotification extends Notification {
  type = NotificationType.LU;
  constructor(id: string, location: string, diagnostic: Diagnostic, luFile: LuFile, dialogs: DialogInfo[]) {
    super(id, location, diagnostic);
    this.dialogPath = this.findDialogPath(luFile, dialogs, diagnostic);
    this.message = createSingleMessage(diagnostic);
  }

  private findDialogPath(luFile: LuFile, dialogs: DialogInfo[], d: Diagnostic) {
    const intentName = luFile.intents.find(intent => {
      const { range } = intent;
      if (!range) return false;
      return isDiagnosticWithInRange(d, range);
    })?.Name;

    return dialogs.find(dialog => dialog.id === luFile.id)?.referredLuIntents.find(lu => lu.name === intentName)?.path;
  }
}
