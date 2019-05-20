import React, { Fragment, useContext, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import formatMessage from 'format-message';
import { NeutralColors, Depths } from '@uifabric/fluent-theme';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';

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
      <div style={{ height: 'calc(100vh - 50px)', display: 'flex' }}>
        <div
          style={{
            width: '80px',
            backgroundColor: NeutralColors.gray20,
            height: 'calc(100vh - 105px)',
            boxShadow: Depths.depth8,
          }}
        >
          <NavItem to="/" exact={true} iconName="SplitObject" label={formatMessage('Design')} />
          <NavItem to="content" iconName="CollapseMenu" label={formatMessage('Content')} />
          <NavItem to="setting" iconName="Settings" label={formatMessage('Settings')} />
        </div>
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            zIndex: 2,
            flex: 1,
          }}
        >
          <Routes />
        </div>
      </div>
    </Fragment>
  );
}
