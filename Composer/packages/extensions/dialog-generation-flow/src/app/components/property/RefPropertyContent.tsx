// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import * as React from 'react';
import { RefPropertyPayload } from 'src/app/stores/schemaPropertyStore';

const availableTemplates: Record<string, string[]> = {
  age: ['age'],
  datetime: ['datetime'],
  dimension: ['dimension'],
  geography: ['geographyV2'],
  money: ['money'],
  ordinal: ['ordinalV2'],
  temperature: ['temperature'],
};

const templateOptions = Object.keys(availableTemplates).reduce<IDropdownOption[]>((acc, key) => {
  acc.push(
    ...availableTemplates[key].map<IDropdownOption>((item) => ({
      key: `${key}:${item}`,
      text: `${key}:${item}`,
      data: { key, item },
    }))
  );

  return acc;
}, [] as IDropdownOption[]);

type Props = {
  payload: RefPropertyPayload;
  onChangePayload: (payload: RefPropertyPayload) => void;
};

export const RefPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  let selectedKey = '';
  if (payload.ref) {
    const [key, item] = payload.ref.split(':');
    if (key && item) {
      selectedKey = `${key}:${item}`;
    }
  }

  return (
    <Dropdown
      label="Select from templates"
      options={templateOptions}
      selectedKey={selectedKey}
      onChange={(_e, option) => onChangePayload({ kind: 'ref', ref: option.key } as RefPropertyPayload)}
    />
  );
});
