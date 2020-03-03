// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { DiagnosticSeverity } from './types';
import { notificationHeader, notificationHeaderText, dropdownStyles } from './styles';

const createOptions = (): IDropdownOption[] => {
  const defaultOptions: IDropdownOption[] = [
    { key: formatMessage('Show All Notifications'), text: formatMessage('All'), data: '', isSelected: true },
  ];
  DiagnosticSeverity.forEach(item => {
    return defaultOptions.push({ key: item, text: item, data: item });
  });
  return defaultOptions;
};

export interface INotificationHeader {
  onChange: (text: string) => void;
}

export const NotificationHeader: React.FC<INotificationHeader> = props => {
  const { onChange } = props;

  return (
    <div css={notificationHeader}>
      <h1 css={notificationHeaderText}>{formatMessage('Notifications')}</h1>
      <Dropdown
        onChange={(event, option) => {
          if (option) onChange(option.data);
        }}
        options={createOptions()}
        styles={dropdownStyles}
        data-testid="notifications-dropdown"
      />
    </div>
  );
};
