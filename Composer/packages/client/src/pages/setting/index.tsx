// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useMemo } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { StoreContext } from '../../store';
import { TestController } from '../../components/TestController';
import { OpenConfirmModal } from '../../components/Modal/Confirm';
import { navigateTo } from '../../utils';
import { Page } from '../../components/Page';
import { INavTreeItem } from '../../components/NavTree';

import Routes from './router';

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
    const boldWarningText = formatMessage(
      'Warning: the action you are about to take cannot be undone. Going further will delete this bot and any related files in the bot project folder.'
    );
    const warningText = formatMessage('External resources will not be changed.');
    const title = formatMessage('Delete Bot');
    const checkboxLabel = formatMessage('I want to delete this bot');
    const settings = {
      onRenderContent: () => {
        return (
          <div
            style={{
              background: '#ffddcc',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '24px',
            }}
          >
            <FontIcon
              iconName="Warning12"
              style={{
                color: '#DD4400',
                fontSize: 36,
                padding: '32px',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Text
                block
                style={{
                  fontWeight: 'bold',
                  marginTop: '24px',
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {boldWarningText}
              </Text>
              <Text
                block
                style={{
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {warningText}
              </Text>
            </div>
          </div>
        );
      },
      disabled: true,
      checkboxLabel,
      confirmBtnText: formatMessage('Delete'),
    };
    const res = await OpenConfirmModal(title, null, settings);
    if (res) {
      await actions.deleteBotProject(projectId);
      navigateTo('home');
    }
  };

  const toolbarItems = [
    {
      type: 'action',
      text: formatMessage('Delete'),
      buttonProps: {
        iconProps: {
          iconName: 'Delete',
        },
        onClick: openDeleteBotModal,
      },
      align: 'left',
    },
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
