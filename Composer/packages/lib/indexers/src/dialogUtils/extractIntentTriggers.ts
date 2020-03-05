// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKTypes } from '@bfc/shared';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

import { IIntentTrigger } from './types';

// find out all properties from given dialog
function ExtractIntentTriggers(value: any): IIntentTrigger[] {
  const triggers: IIntentTrigger[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (value?.$type === SDKTypes.OnIntent) {
      if (value.intent) {
        const dialogs: string[] = [];

        const visitor: VisitorFunc = (path: string, value: any): boolean => {
          if (value?.$type === SDKTypes.BeginDialog) {
            if (value.dialog) {
              dialogs.push(value.dialog);
            }
            return true;
          }
          return false;
        };
        JsonWalk('$', value, visitor);
        if (dialogs.length) {
          triggers.push({
            intent: value.intent,
            dialogs,
          });
        }
      }
      return true;
    }
    return false;
  };
  JsonWalk('$', value, visitor);

  return triggers;
}

export default ExtractIntentTriggers;
