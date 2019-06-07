/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';
import { main, sideBar, content, divider, globalNav } from './styles';

initializeIcons(/* optional base url */);

// eslint-disable-next-line react/display-name
const Content = forwardRef((props, ref) => <div css={content} {...props} ref={ref} />);

export function App() {
  const { state, actions } = useContext(Store);
  const [sideBarExpand, setSideBarExpand] = useState('');
  const { botStatus } = state;
  const { connectBot, reloadBot, setStorageExplorerStatus } = actions;
  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        connectBot={connectBot}
        reloadBot={reloadBot}
        openStorageExplorer={setStorageExplorerStatus}
      />
      <StorageExplorer />
      <div css={main}>
        <div css={sideBar(sideBarExpand)}>
          <IconButton
            iconProps={{ iconName: 'GlobalNavButton' }}
            css={globalNav}
            onClick={() => {
              setSideBarExpand(!sideBarExpand);
            }}
          />
          <div css={divider} />
          <NavItem
            to="/"
            exact={true}
            iconName="SplitObject"
            labelName={formatMessage('Flow design')}
            labelHide={!sideBarExpand}
          />
          <NavItem
            to="language-generation/all"
            iconName="Robot"
            labelName={formatMessage('Bot says')}
            labelHide={!sideBarExpand}
          />
          <NavItem
            to="language-understanding/all"
            iconName="People"
            labelName={formatMessage('User says')}
            labelHide={!sideBarExpand}
          />
          <NavItem to="setting" iconName="Settings" labelName={formatMessage('Settings')} labelHide={!sideBarExpand} />
        </div>

        <Routes component={Content} />
      </div>
    </Fragment>
  );
}
