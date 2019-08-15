/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react';
import { Link } from '@reach/router';

import { ToolBar } from '../../components/ToolBar';
import { navigateTo } from '../../utils';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { title, fileList, contentEditor, linkItem } from './styles';
import { MainContent } from './../../components/MainContent/index';
import { TestController } from './../../TestController';

const links = [
  { key: 'dialog-settings', name: formatMessage('Dialog settings') },
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
                <div css={title}>{formatMessage('Settings')}</div>
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
