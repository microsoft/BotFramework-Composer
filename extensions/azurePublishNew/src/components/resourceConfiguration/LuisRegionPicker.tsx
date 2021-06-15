// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';

type Props = {
  onLuisRegionChange: (luisRegion: string) => void;
} & Omit<SearchableDropdownProps, 'onSubmit'>;

export const LuisRegionPicker = React.memo((props: Props) => {
  const localTextFieldProps = { placeholder: formatMessage('Select Region') };
  const { items } = props;
  return (
    <SearchableDropdown
      onSubmit={(option) => props.onLuisRegionChange(option.key)}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        value: items.find((i) => i.key === props.value)?.text,
      }}
    />
  );
});
