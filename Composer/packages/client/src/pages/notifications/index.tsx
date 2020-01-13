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
import { INotification } from './types';
import { navigateTo } from './../../utils';
import { convertDialogDiagnosticToUrl, convertInlineLgDiagnosticToUrl } from './../../utils/navigation';

const Notifications: React.FC<RouteComponentProps> = () => {
  const [filter, setFilter] = useState('');
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const notifications = useNotifications(filter);
  const navigations = {
    inlineLgTemplate: (item: INotification) => {
      const url = convertInlineLgDiagnosticToUrl(item.id, dialogs);
      navigateTo(url);
    },
    customCraftedLgTemplateg: (item: INotification) => {
      navigateTo(`/language-generation/${item.id}/edit#L=${item.diagnostic.range?.start.line || 0}`);
    },
    lu: (item: INotification) => {
      navigateTo(`/dialogs/${item.id}`);
    },
    dialog: (item: INotification) => {
      //path is like main.trigers[0].actions[0]
      //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
      const uri = convertDialogDiagnosticToUrl(item.diagnostic);
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
