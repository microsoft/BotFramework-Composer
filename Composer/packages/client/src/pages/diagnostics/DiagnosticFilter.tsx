// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { DiagnosticSeverity } from './types';

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 180, marginLeft: 'auto' },
};

const createOptions = (): IDropdownOption[] => {
  const defaultOptions: IDropdownOption[] = [
    {
      key: formatMessage('Show All Diagnostics'),
      text: formatMessage('All'),
      ariaLabel: formatMessage('Show All Diagnostics'),
      data: '',
      isSelected: true,
    },
  ];
  DiagnosticSeverity.forEach((item) => {
    return defaultOptions.push({ key: item, text: item, data: item, ariaLabel: `Show ${item} Diagnostics` });
  });
  return defaultOptions;
};

export interface INotificationFilter {
  onChange: (text: string) => void;
}

export const NotificationFilter: React.FC<INotificationFilter> = (props) => {
  const { onChange } = props;

  return (
    <Dropdown
      ariaLabel={formatMessage('Diagnostic type')}
      data-testid="notifications-dropdown"
      options={createOptions()}
      styles={dropdownStyles}
      onChange={(event, option) => {
        if (option) onChange(option.data);
      }}
    />
  );
};
