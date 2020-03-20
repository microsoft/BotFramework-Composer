// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';
import formatMessage from 'format-message';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import { ToolBar } from '../../components/ToolBar';
import { navigateTo } from '../../utils';
import { isAbsHosted } from '../../utils/envUtil';
import { Tree } from '../../components/Tree/index';
import { Conversation } from '../../components/Conversation/index';
import { MainContent } from '../../components/MainContent/index';
import { TestController } from '../../TestController';

import Routes from './router';
import { title, fileList, contentEditor } from './styles';

const settingLabels = {
  title: formatMessage('Configuration'),
  publish: formatMessage('Publish'),
  settings: formatMessage('Settings'),
  onboarding: formatMessage('Onboarding'),
};

const absHosted = isAbsHosted();

const links = [
  { key: '/setting/dialog-settings', name: settingLabels.settings, url: '' },
  { key: `/setting/${absHosted ? 'remote-publish' : 'deployment'}`, name: settingLabels.publish, url: '' },
  { key: '/setting/onboarding-settings', name: settingLabels.onboarding, url: '' },
  // { key: '/setting/publish', name: settingLabels.publish, url: '' },

  // { key: 'services', name: formatMessage('Services') },
  // { key: 'composer-configuration', name: formatMessage('Composer configuration'), disabled: true },
  // { key: 'publishing-staging', name: formatMessage('Publishing and staging'), disabled: true },
];

const SettingPage: React.FC<RouteComponentProps> = () => {
  const { state } = useContext(StoreContext);
  const { projectId } = state;
  const makeProjectLink = (id, path) => {
    return `/bot/${id}${path}`;
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
      <ToolBar toolbarItems={toolbarItems} />
      <MainContent>
        <Fragment>
          <div css={fileList}>
            <Tree variant="large">
              <Nav
                onRenderGroupHeader={_onRenderGroupHeader}
                groups={[
                  {
                    name: settingLabels.title,
                    links,
                  },
                ]}
                onLinkClick={(e, item) => {
                  navigateTo(makeProjectLink(projectId, item?.key));
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
