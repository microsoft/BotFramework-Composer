/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { Fragment, useState } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react';
import { Link } from '@reach/router';

import { ToolBar } from '../../components/ToolBar';
import { navigateTo } from '../../utils';
import { isAbsHosted } from '../../utils/envUtil';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { title, fileList, contentEditor, linkItem } from './styles';
import { MainContent } from './../../components/MainContent/index';
import { TestController } from './../../TestController';

const settingLabels = {
  title: formatMessage('Configuration'),
  publish: formatMessage('Publish'),
  settings: formatMessage('Settings'),
};

const absHosted = isAbsHosted();

const links = [
  { key: '/setting/dialog-settings', name: settingLabels.settings },
  { key: `/setting/${absHosted ? 'remote-publish' : 'deployment'}`, name: settingLabels.publish },
  // { key: 'services', name: formatMessage('Services') },
  // { key: 'composer-configuration', name: formatMessage('Composer configuration'), disabled: true },
  // { key: 'publishing-staging', name: formatMessage('Publishing and staging'), disabled: true },
];

export const SettingPage = () => {
  const [active, setActive] = useState();

  function onRenderLink(link) {
    return (
      <Link
        to={link.key}
        css={linkItem(link.disabled)}
        tabIndex={-1}
        getProps={({ isCurrent }) => {
          if (isCurrent && active !== link.key) {
            setActive(link.key);
          }
        }}
        onClick={() => {}}
      >
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
                    navigateTo(item.key);
                  }}
                />
              </div>
            </Tree>
          </div>
          <Conversation extraCss={contentEditor}>
            <Routes />
          </Conversation>
        </Fragment>
      </MainContent>
    </Fragment>
  );
};
