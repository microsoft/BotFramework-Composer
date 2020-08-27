// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SwitchCondition, CaseCondition } from '../types';

import { ExternalApi } from './ExternalApi';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copySwitchCondition = async (
  input: SwitchCondition,
  externalApi: ExternalApi
): Promise<SwitchCondition> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.default)) {
    copy.default = await copyAdaptiveActionList(input.default, externalApi);
  }

  if (Array.isArray(input.cases)) {
    const copiedCases: CaseCondition[] = [];
    for (const caseCondition of input.cases) {
      copiedCases.push({
        value: caseCondition.value,
        actions: await copyAdaptiveActionList(caseCondition.actions, externalApi),
      });
    }
    copy.cases = copiedCases;
  }

  return copy;
};
