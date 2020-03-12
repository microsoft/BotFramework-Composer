// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { Link, RouteComponentProps } from '@reach/router';

import { ToolBar } from '../../components/ToolBar';
import { navigateTo } from '../../utils';
import { isAbsHosted } from '../../utils/envUtil';
import { Tree } from '../../components/Tree/index';
import { Conversation } from '../../components/Conversation/index';
import { MainContent } from '../../components/MainContent/index';
import { TestController } from '../../TestController';

import Routes from './router';
import { title, fileList, contentEditor, linkItem } from './styles';
import { useLocation } from '../../utils/hooks';

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
  // { key: 'services', name: formatMessage('Services') },
  // { key: 'composer-configuration', name: formatMessage('Composer configuration'), disabled: true },
  // { key: 'publishing-staging', name: formatMessage('Publishing and staging'), disabled: true },
];

const SettingPage: React.FC<RouteComponentProps> = () => {
  const {
    location: { pathname: active },
  } = useLocation();

  function onRenderLink(link) {
    return (
      <Link to={link.key} css={linkItem(link.disabled)} tabIndex={-1} onClick={() => {}}>
        {link.name}
      </Link>
    );
  }

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <Fragment>
      <ToolBar toolbarItems={toolbarItems} />
      <MainContent>
        <Fragment>
          <div css={fileList}>
            <Tree variant="large">
              <div>
                <div css={title}>{settingLabels.title}</div>
                <Nav
                  groups={[{ links }]}
                  onRenderLink={onRenderLink}
                  selectedKey={active}
                  onLinkClick={(e, item) => {
                    if (item && item.key) {
                      navigateTo(item.key);
                    }
                  }}
                />
              </div>
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
