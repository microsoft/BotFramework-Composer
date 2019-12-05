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
    navigateTo(`/language-generation/#line=${item.diagnostic.range?.start.line || 0}`);
  },
  lu: (item: INotification) => {
    navigateTo(`/dialogs/${item.id}`);
  },
  dialog: (item: INotification) => {
    //path is like main.trigers[0].actions[0]
    //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
    const path = item.diagnostic.path;
    let uri = `/dialogs/${item.id}`;
    if (path) {
      const matchTriggers = /triggers\[(\d+)\]/g.exec(path);
      const matchActions = /actions\[(\d+)\]/g.exec(path);
      const trigger = matchTriggers ? `triggers[${+matchTriggers[1]}]` : '';
      const action = matchActions ? `actions[${+matchActions[1]}]` : '';
      if (trigger) {
        uri += `?selected=${trigger}`;
        if (action) {
          uri += `&focused=${trigger}.${action}`;
        }
      }
    }
    navigateTo(uri);
  },
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
