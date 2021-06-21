// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useEffect, useState, Fragment } from 'react';

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

interface DropdownWithAllOptionProps {
  placeholder: string;
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
  dropdownOptions: IDropdownOption[];
  optionAll: {
    key: string;
    text: string;
  };
}

export const DropdownWithAllOption: React.FC<DropdownWithAllOptionProps> = (props) => {
  const { selectedKeys, setSelectedKeys, placeholder, dropdownOptions, optionAll } = props;
  const [currentOptions, setCurrentOptions] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    const allOptions = [...dropdownOptions];
    if (allOptions.length > 1) {
      allOptions.unshift({
        key: optionAll.key,
        text: optionAll.text,
      });
    }

    setCurrentOptions(allOptions);
  }, [dropdownOptions]);

  const onOptionSelectionChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption | undefined): void => {
    if (item) {
      if (item.key === optionAll.key) {
        if (!item.selected) {
          setSelectedKeys([]);
        } else {
          const allOptions = currentOptions.map((option) => option.key as string);
          setSelectedKeys(allOptions);
        }
        return;
      }

      const tempState = [...selectedKeys];
      const allIndex = tempState.findIndex((option) => option === optionAll.key);
      if (allIndex !== -1) {
        tempState.splice(allIndex, 1);
      }
      setSelectedKeys(item.selected ? [...tempState, item.key as string] : tempState.filter((key) => key !== item.key));
    }
  };

  const onRenderTitle = (selectedItems: IDropdownOption[] | undefined): JSX.Element | null => {
    const allIndex = selectedKeys.findIndex((option) => option === optionAll.key);
    if (allIndex !== -1) {
      return <Fragment>{currentOptions[0].text}</Fragment>;
    }
    if (selectedItems?.length) {
      const items = selectedItems.map((item) => item.text);
      return <Fragment>{items.join(', ')}</Fragment>;
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
