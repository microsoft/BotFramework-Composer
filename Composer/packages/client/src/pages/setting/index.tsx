// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';
import formatMessage from 'format-message';
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import { ToolBar } from '../../components/ToolBar';
import { navigateTo } from '../../utils';
import { Tree } from '../../components/Tree/index';
import { Conversation } from '../../components/Conversation/index';
import { MainContent } from '../../components/MainContent/index';
import { TestController } from '../../components/TestController';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { OpenConfirmModal } from '../../components/Modal/Confirm';

import settingStorage from './../../utils/dialogSettingStorage';
import Routes from './router';
import { title, fileList, contentEditor, confirmation, confirmationContent } from './styles';

const SettingPage: React.FC<RouteComponentProps<{ '*': string }>> = props => {
  const { state, actions } = useContext(StoreContext);
  const { projectId, botName } = state;
  const makeProjectLink = (id: string, path: string) => {
    return `/bot/${id}/settings/${path}`;
  };

  const settingLabels = {
    title: formatMessage('Configuration'),
    settings: formatMessage('Settings'),
    preferences: formatMessage('User Preferences'),
    runtime: formatMessage('Runtime Config'),
  };

  const links: INavLink[] = [
    { key: 'dialog-settings', name: settingLabels.settings, url: '' },
    { key: 'preferences', name: settingLabels.preferences, url: '' },
    { key: 'runtime', name: settingLabels.runtime, url: '' },

    // { key: '/settings/publish', name: settingLabels.publish, url: '' },

    // { key: 'services', name: formatMessage('Services') },
    // { key: 'publishing-staging', name: formatMessage('Publishing and staging'), disabled: true },
  ];

  const openDeleteBotModal = async () => {
    const subTitle = formatMessage('Warning: are you sure to delete current bot?');
    const title = formatMessage('Delete Bots');
    const checkboxLabel = formatMessage('I want to delete this bot');
    const styles = { content: confirmationContent };
    const settings = {
      onRenderContent: () => {
        return <div css={confirmation}> {subTitle} </div>;
      },
      disabled: true,
      checkboxLabel,
      styles,
    };
    const res = await OpenConfirmModal(title, subTitle, settings);
    if (res) {
      actions.deleteBotProject(projectId);
      actions.deleteLocalRuntimeData(projectId);
      luFileStatusStorage.removeAllStatuses(botName);
      settingStorage.remove(botName);
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

  const _onRenderGroupHeader = (group: INavLinkGroup | undefined) => {
    return <div css={title}>{group?.name}</div>;
  };

  return (
    <Fragment>
      <ToolBar toolbarItems={toolbarItems} openDeleteBotModal={openDeleteBotModal} />
      <MainContent>
        <Fragment>
          <div css={fileList}>
            <Tree variant="large">
              <Nav
                initialSelectedKey={props['*'] || 'dialog-settings'}
                onRenderGroupHeader={_onRenderGroupHeader}
                groups={[
                  {
                    name: settingLabels.title,
                    links,
                  },
                ]}
                onLinkClick={(e, item) => {
                  navigateTo(makeProjectLink(projectId, item?.key as string));
                }}
              />
            </Tree>
          </div>
          <Conversation css={contentEditor}>
            <Routes />
          </Conversation>
        </Fragment>
      </MainContent>
    </Fragment>
  );
};

export default SettingPage;
