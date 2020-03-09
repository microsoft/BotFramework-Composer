// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';

import { ToolBar } from './../../components/ToolBar/index';
import useNotifications from './useNotifications';
import { NotificationList } from './NotificationList';
import { NotificationHeader } from './NotificationHeader';
import { root } from './styles';
import { INotification, NotificationType } from './types';
import { navigateTo } from './../../utils';
import { convertPathToUrl, toUrlUtil } from './../../utils/navigation';

const Notifications: React.FC<RouteComponentProps> = () => {
  const { state } = useContext(StoreContext);
  const { projectId } = state;
  const [filter, setFilter] = useState('');
  const notifications = useNotifications(filter);
  const navigations = {
    [NotificationType.LG]: (item: INotification) => {
      let url = `/bot/${projectId}/language-generation/${item.id}/edit#L=${item.diagnostic.range?.start.line || 0}`;
      //the format of item.id is lgFile#inlineTemplateId
      if (item.dialogPath) {
        url = toUrlUtil(projectId, item.dialogPath);
      }
      navigateTo(url);
    },
    [NotificationType.LU]: (item: INotification) => {
      let uri = `/bot/${projectId}/language-understanding/${item.id}`;
      if (item.dialogPath) {
        uri = convertPathToUrl(item.id, item.dialogPath);
      }
      navigateTo(uri);
    },
    [NotificationType.DIALOG]: (item: INotification) => {
      //path is like main.trigers[0].actions[0]
      //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
      const uri = convertPathToUrl(projectId, item.id, item.dialogPath);
      navigateTo(uri);
    },
  };
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
