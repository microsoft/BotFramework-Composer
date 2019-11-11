// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Dropdown } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { useMemo } from 'react';

import { notificationHeader, notificationHeaderText, dropdownStyles } from './styles';

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
