// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownOption, IDropdownStyles, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useMemo } from 'react';

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

export interface DropdownWithAllOptionProps extends Omit<IDropdownProps, 'onChange'> {
  selectedKeys: string[];
  onChange: (event: React.FormEvent<HTMLDivElement>, selectedItems: string[]) => void;
  optionAll: {
    key: string;
    text: string;
  };
}

export const DropdownWithAllOption: React.FC<DropdownWithAllOptionProps> = (props) => {
  const { selectedKeys, onChange, placeholder, options: dropdownOptions, optionAll } = props;

  const currentOptions = useMemo(() => {
    return [
      {
        key: optionAll.key,
        text: optionAll.text,
      },
      ...dropdownOptions,
    ];
  }, [dropdownOptions]);

  const onOptionSelectionChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption | undefined): void => {
    if (item) {
      if (item.key === optionAll.key) {
        if (!item.selected) {
          onChange(event, []);
        } else {
          const allOptions = currentOptions.map((option) => option.key as string);
          onChange(event, allOptions);
        }
        return;
      }

      const tempState = [...selectedKeys];
      const allIndex = tempState.findIndex((option) => option === optionAll.key);
      if (allIndex !== -1) {
        tempState.splice(allIndex, 1);
      }
      onChange(event, item.selected ? [...tempState, item.key as string] : tempState.filter((key) => key !== item.key));
    }
  };

  const onRenderTitle = (selectedItems: IDropdownOption[] | undefined): JSX.Element | null => {
    const allIndex = selectedKeys.findIndex((option) => option === optionAll.key);
    if (allIndex !== -1) {
      return currentOptions[0].text as any;
    }
    if (selectedItems?.length) {
      const items = selectedItems.map((item) => item.text);
      return items.join(', ') as any;
    }
    return null;
  };

  return (
    <Dropdown
      multiSelect
      options={currentOptions}
      placeholder={placeholder}
      selectedKeys={selectedKeys}
      styles={dropdownStyles}
      onChange={onOptionSelectionChange}
      onRenderTitle={onRenderTitle}
    />
  );
};
