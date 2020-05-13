// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useMemo } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import { TestController } from '../../components/TestController';
import { OpenConfirmModal } from '../../components/Modal/Confirm';
import { navigateTo } from '../../utils';

import Routes from './router';
import { Page } from '../../components/Page';
import { INavTreeItem } from '../../components/NavTree';


const SettingPage: React.FC<RouteComponentProps<{ '*': string }>> = () => {
  const { state, actions } = useContext(StoreContext);
  const { projectId } = state;
  const makeProjectLink = (id: string, path: string) => {
    return `/bot/${id}/settings/${path}`;
  };

  const settingLabels = {
    botSettings: formatMessage('Bot Settings'),
    appSettings: formatMessage('App Settings'),
    runtime: formatMessage('Runtime Config'),
  };

  const links: INavTreeItem[] = [
    { id: 'dialog-settings', name: settingLabels.botSettings, url: makeProjectLink(projectId, 'dialog-settings') },
    { id: 'preferences', name: settingLabels.appSettings, url: makeProjectLink(projectId, 'preferences') },
    { id: 'runtime', name: settingLabels.runtime, url: makeProjectLink(projectId, 'runtime') },

    // { key: '/settings/publish', name: settingLabels.publish, url: '' },

    // { key: 'services', name: formatMessage('Services') },
    // { key: 'publishing-staging', name: formatMessage('Publishing and staging'), disabled: true },
  ];

  const openDeleteBotModal = async () => {
    const subTitle = formatMessage('Warning: are you sure to delete current bot?');
    const title = formatMessage('Delete Bots');
    const checkboxLabel = formatMessage('I want to delete this bot');
    const settings = {
      onRenderContent: () => {
        return <div> {subTitle} </div>;
      },
      disabled: true,
      checkboxLabel,
    };
    const res = await OpenConfirmModal(title, subTitle, settings);
    if (res) {
      actions.deleteBotProject(projectId);
      navigateTo('home');
    }
  };

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  const title = useMemo(() => {
    const page = links.find(l => location.pathname.includes(l.url));
    if (page) {
      return page.name;
    }

    return settingLabels.botSettings;
  }, [location.pathname]);

  return (
    <Page title={title} toolbarItems={toolbarItems} navLinks={links}>
      <Routes />
    </Page>
  );
};

export default SettingPage;
