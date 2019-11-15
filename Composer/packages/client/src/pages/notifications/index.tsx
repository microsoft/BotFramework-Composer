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

const Notifications: React.FC<RouteComponentProps> = () => {
  const [filter, setFilter] = useState('');
  const { notifications, locations } = useNotifications(filter);
  return (
    <div css={root}>
      <ToolBar />
      <NotificationHeader items={locations} onChange={setFilter} />
      <NotificationList items={notifications} />
    </div>
  );
};

export default Notifications;
