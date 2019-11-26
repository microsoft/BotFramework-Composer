// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { ToolBar } from './../../components/ToolBar/index';
import useNotifications from './useNotifications';
import { NotificationList } from './NotificationList';
import { NotificationHeader } from './NotificationHeader';
import { root } from './styles';
import { INotification } from './types';
import { navigateTo } from './../../utils';

const navigations = {
  lg: (item: INotification) => {
    navigateTo(`/language-generation/#line=${item.diagnostic.Range.Start.Line || 0}`);
  },
  lu: (item: INotification) => {},
  dialog: (item: INotification) => {},
};
const Notifications: React.FC<RouteComponentProps> = () => {
  const [filter, setFilter] = useState('');
  const { notifications, locations } = useNotifications(filter);
  const handleItemInvoked = (item: INotification) => {
    navigations[item.type](item);
  };
  return (
    <div css={root} data-testid="notifications-page">
      <ToolBar />
      <NotificationHeader items={locations} onChange={setFilter} />
      <NotificationList items={notifications} onItemInvoked={handleItemInvoked} />
    </div>
  );
};

export default Notifications;
