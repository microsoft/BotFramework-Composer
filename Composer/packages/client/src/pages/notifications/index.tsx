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
  const [filter, setFilter] = useState('');
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const notifications = useNotifications(filter);
  const navigations = {
    [NotificationType.LG]: (item: INotification) => {
      let url = `/language-generation/${item.id}/edit#L=${item.diagnostic.range?.start.line || 0}`;
      const dividerIndex = item.id.indexOf('#');
      //the format of item.id is lgFile#inlineTemplateId
      if (dividerIndex > -1) {
        const templateId = item.id.substring(dividerIndex + 1);
        const lgFile = item.id.substring(0, dividerIndex);
        const dialog = dialogs.find(d => d.lgFile === lgFile);
        const lgTemplate = dialog ? dialog.lgTemplates.find(lg => lg.name === templateId) : null;
        const path = lgTemplate ? lgTemplate.path : '';
        if (path && dialog) {
          url = toUrlUtil(dialog.id, path);
        }
      }
      navigateTo(url);
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
