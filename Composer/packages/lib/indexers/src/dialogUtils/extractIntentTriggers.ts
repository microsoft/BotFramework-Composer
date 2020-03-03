// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKTypes } from '@bfc/shared';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

import { IIntentTrigger } from './types';

// find out all properties from given dialog
function ExtractIntentTriggers(value: any): IIntentTrigger[] {
  const triggers: IIntentTrigger[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (value?.$type === SDKTypes.OnIntent && value.actions?.[0]?.$type === SDKTypes.BeginDialog) {
      triggers.push({
        intent: value.intent,
        dialog: value.actions[0].dialog,
      });
      return true;
    }
    return false;
  };
  JsonWalk('$', value, visitor);

  return triggers;
}

export default ExtractIntentTriggers;
