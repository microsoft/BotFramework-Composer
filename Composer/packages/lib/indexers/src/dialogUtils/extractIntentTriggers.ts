// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKKinds, IIntentTrigger, FieldNames } from '@bfc/shared';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

function ExtractAllBeginDialogs(value: any): string[] {
  const dialogs: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (value?.$kind === SDKKinds.BeginDialog && value?.dialog) {
      dialogs.push(value.dialog);
      return true;
    }
    return false;
  };

  JsonWalk('$', value, visitor);

  return dialogs;
}

// find out all properties from given dialog
function ExtractIntentTriggers(value: any): IIntentTrigger[] {
  const intentTriggers: IIntentTrigger[] = [];
  const triggers = value?.[FieldNames.Events];

  if (triggers?.length) {
    for (const trigger of triggers) {
      const dialogs = ExtractAllBeginDialogs(trigger);

      if (trigger.$kind === SDKKinds.OnIntent && trigger.intent) {
        intentTriggers.push({ intent: trigger.intent, dialogs });
      } else if (trigger.$kind !== SDKKinds.OnIntent && dialogs.length) {
        const emptyIntent = intentTriggers.find((e) => e.intent === '');
        if (emptyIntent) {
          //remove the duplication dialogs
          const all = new Set<string>([...emptyIntent.dialogs, ...dialogs]);
          emptyIntent.dialogs = Array.from(all);
        } else {
          intentTriggers.push({ intent: '', dialogs });
        }
      }
    }
  }

  return intentTriggers;
}

export default ExtractIntentTriggers;
