// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Dropdown, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { useMemo } from 'react';

import { notificationHeader, notificationHeaderText } from './styles';

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 180, marginLeft: 'auto' },
};

export interface INotificationHeader {
  onChange: (text: string) => void;
  items: string[];
}

export const NotificationHeader: React.FC<INotificationHeader> = props => {
  const { onChange, items } = props;
  const options = useMemo(() => {
    return items.map(item => {
      return { key: item, text: item };
    });
  }, [items]);

  return (
    <div css={notificationHeader}>
      <div css={notificationHeaderText}>{formatMessage('Notifications')}</div>
      <Dropdown
        onChange={(event, option) => {
          if (option) onChange(option.text);
        }}
        options={options}
        styles={dropdownStyles}
        defaultSelectedKey="All"
      />
    </div>
  );
};
