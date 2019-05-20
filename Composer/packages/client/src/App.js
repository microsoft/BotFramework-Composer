/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';
import { main, sideBar, content } from './styles';

initializeIcons(/* optional base url */);

export function App() {
  const { state, actions } = useContext(Store);
  const { botStatus } = state;
  const { toggleBot, setStorageExplorerStatus } = actions;
  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        setBotStatus={status => {
          toggleBot(status);
        }}
        openStorageExplorer={setStorageExplorerStatus}
      />
      <StorageExplorer />
      <div css={main}>
        <div css={sideBar}>
          <NavItem to="/" exact={true} iconName="SplitObject" label={formatMessage('Design')} />
          <NavItem to="content" iconName="CollapseMenu" label={formatMessage('Content')} />
          <NavItem to="setting" iconName="Settings" label={formatMessage('Settings')} />
        </div>
        <div css={content}>
          <Routes />
        </div>
      </div>
    </Fragment>
  );
}
