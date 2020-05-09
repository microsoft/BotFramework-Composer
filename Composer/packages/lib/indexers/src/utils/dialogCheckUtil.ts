// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import { SDKKinds } from '@bfc/shared';

import { VisitorFunc, JsonWalk } from './jsonWalk';

/**
 * fix dialog referrence.
 * - "dialog": 'AddTodos'
 * + "dialog": 'addtodos'
 */
export function autofixReferInDialog(dialogId: string, dialog: { [key: string]: any }): { [key: string]: any } {
  const dialogJson = { ...dialog };
  // fix dialog referrence
  const visitor: VisitorFunc = (_path: string, value: any) => {
    if (has(value, '$type') && value.$type === SDKKinds.BeginDialog) {
      const dialogName = value.dialog;
      value.dialog = dialogName.toLowerCase();
    }
    return false;
  };

  JsonWalk('/', dialogJson, visitor);

  // fix lg referrence
  dialogJson.generator = `${dialogId}.lg`;

  // fix lu referrence
  if (typeof dialogJson.recognizer === 'string') {
    dialogJson.recognizer = `${dialogId}.lu`;
  }

  return dialogJson;
}
