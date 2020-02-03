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
import { INotification, NotificationType } from './types';
import { navigateTo } from './../../utils';
import { convertPathToUrl } from './../../utils/navigation';

const navigations = {
  [NotificationType.LG]: (item: INotification) => {
    navigateTo(`/language-generation/${item.id}/edit#L=${item.diagnostic.range?.start.line || 0}`);
  },
  [NotificationType.LU]: (item: INotification) => {
    let uri = `/language-understanding/${item.id}`;
    if (item.dialogPath) {
      uri = convertPathToUrl(item.id, item.dialogPath);
    }
    navigateTo(uri);
  },
  [NotificationType.DIALOG]: (item: INotification) => {
    //path is like main.trigers[0].actions[0]
    //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
    const uri = convertPathToUrl(item.id, item.dialogPath);
    navigateTo(uri);
  },
};
const Notifications: React.FC<RouteComponentProps> = () => {
  const [filter, setFilter] = useState('');
  const notifications = useNotifications(filter);
  const handleItemClick = (item: INotification) => {
    navigations[item.type](item);
  };
  return (
    <div css={root} data-testid="notifications-page">
      <ToolBar />
      <NotificationHeader onChange={setFilter} />
      <NotificationList items={notifications} onItemClick={handleItemClick} />
    </div>
  );
};

export default Notifications;
