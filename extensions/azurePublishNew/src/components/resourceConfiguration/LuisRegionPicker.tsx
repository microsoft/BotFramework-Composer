// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { DeployLocation } from '@botframework-composer/types';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';

type Props = {
  luisRegions: DeployLocation[];
  onLuisRegionChange: (luisRegion: string) => void;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit'>;

export const LuisRegionPicker = React.memo((props: Props) => {
  const { luisRegions } = props;

  const localTextFieldProps = { placeholder: formatMessage('Select Region') };

  return (
    <SearchableDropdown
      items={luisRegions.map((t) => ({ key: t.id, text: t.displayName }))}
      onSubmit={(option) => props.onLuisRegionChange(option.key)}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        value: luisRegions.find((lr) => lr.name === props.value)?.displayName,
      }}
    />
  );
});
