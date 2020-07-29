// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';

import { Toolbar } from '../../components/Toolbar';
import { navigateTo } from '../../utils/navigation';
import { convertPathToUrl } from '../../utils/navigation';

import useNotifications from './useNotifications';
import { NotificationList } from './NotificationList';
import { NotificationHeader } from './NotificationHeader';
import { root } from './styles';
import { INotification, NotificationType } from './types';

const Notifications: React.FC<RouteComponentProps> = () => {
  const [filter, setFilter] = useState('');
  const notifications = useNotifications(filter);
  const navigations = {
    [NotificationType.LG]: (item: INotification) => {
      const { projectId, resourceId, diagnostic, dialogPath } = item;
      let uri = `/bot/${projectId}/language-generation/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
      //the format of item.id is lgFile#inlineTemplateId
      if (dialogPath) {
        uri = convertPathToUrl(projectId, resourceId, dialogPath);
      }
      navigateTo(uri);
    },
    [NotificationType.LU]: (item: INotification) => {
      const { projectId, resourceId, diagnostic, dialogPath } = item;
      let uri = `/bot/${projectId}/language-understanding/${resourceId}/edit#L=${diagnostic.range?.start.line || 0}`;
      if (dialogPath) {
        uri = convertPathToUrl(projectId, resourceId, dialogPath);
      }
      navigateTo(uri);
    },
    [NotificationType.DIALOG]: (item: INotification) => {
      //path is like main.trigers[0].actions[0]
      //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
      const { projectId, id, dialogPath } = item;
      const uri = convertPathToUrl(projectId, id, dialogPath);
      navigateTo(uri);
    },
    [NotificationType.SKILL]: (item: INotification) => {
      const { projectId } = item;
      navigateTo(`/bot/${projectId}/skills`);
    },
    [NotificationType.SETTING]: (item: INotification) => {
      const { projectId } = item;
      navigateTo(`/settings/bot/${projectId}/dialog-settings`);
    },
  };
  const handleItemClick = (item: INotification) => {
    navigations[item.type](item);
  };
  return (
    <div css={root} data-testid="notifications-page">
      <Toolbar />
      <NotificationHeader onChange={setFilter} />
      <NotificationList items={notifications} onItemClick={handleItemClick} />
    </div>
  );
};

export default Notifications;
