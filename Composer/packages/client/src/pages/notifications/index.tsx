// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { ToolBar } from './../../components/ToolBar/index';
import useNotifications from './useNotifications';
import { NotificationList } from './NotificationList';
import { NotificationHeader } from './NotificationHeader';
import { root } from './styles';

export const Notifications = props => {
  const { notifications, setFilter, locations } = useNotifications();
  return (
    <div css={root}>
      <ToolBar />
      <NotificationHeader items={locations} onChange={setFilter} />
      <NotificationList items={notifications} />
    </div>
  );
};
