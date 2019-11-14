// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { useMemo } from 'react';

import { notificationHeader, notificationHeaderText, dropdownStyles } from './styles';

const createOptions = (items: string[]): IDropdownOption[] => {
  const defaultOptions: IDropdownOption[] = [{ key: 'Show All Locations', text: 'All', data: '', isSelected: true }];
  items.forEach(item => {
    return defaultOptions.push({ key: item, text: item, data: item });
  });
  return defaultOptions;
};

export interface INotificationHeader {
  onChange: (text: string) => void;
  items: string[];
}

export const NotificationHeader: React.FC<INotificationHeader> = props => {
  const { onChange, items } = props;
  const options = useMemo(() => {
    return createOptions(items);
  }, [items]);

  return (
    <div css={notificationHeader}>
      <div css={notificationHeaderText}>{formatMessage('Notifications')}</div>
      <Dropdown
        onChange={(event, option) => {
          if (option) onChange(option.data);
        }}
        options={options}
        styles={dropdownStyles}
      />
    </div>
  );
};
