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
export function autofixReferInDialog(dialogId: string, content: string | object): any {
  try {
    const dialogJson = typeof content === 'string' ? JSON.parse(content) : content;

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
    dialogJson.generator = `${dialogId.toLowerCase()}.lg`;

    // fix lu referrence
    if (typeof dialogJson.recognizer === 'string') {
      dialogJson.recognizer = `${dialogId.toLowerCase()}.lu`;
    }

    return dialogJson;
  } catch (_error) {
    // pass, content may be empty
    return content;
  }
}
