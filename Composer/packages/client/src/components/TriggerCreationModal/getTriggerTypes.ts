// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConceptLabels, DialogGroup, dialogGroups } from '@bfc/shared';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { customEventKey } from '../../utils/constants';

export function getTriggerTypes(): IDropdownOption[] {
  const triggerTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.EVENTS].types.map((t) => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        name = labelOverrides.title;
      }

      return { key: t, text: name || t };
    }),
    {
      key: customEventKey,
      text: formatMessage('Custom events'),
    },
  ];
  return triggerTypes;
}
