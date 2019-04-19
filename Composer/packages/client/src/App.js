import React, { Fragment, useContext, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './components/StorageExplorer';
import Routes from './router';
import { Store } from './store/index';

initializeIcons(/* optional base url */);

export function App() {
  const { state, actions } = useContext(Store);
  const { botStatus } = state;

  useEffect(() => {
    actions.fetchProject();
  }, []);

  function handleFileOpen(id, path) {
    actions.closeCurrentProject();
    actions.openBotProject(id, path);
  }

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        setBotStatus={status => {
          actions.toggleBot(status);
        }}
        openStorageExplorer={() => {
          actions.setStorageExplorerStatus('opened');
        }}
      />
      <StorageExplorer onFileOpen={handleFileOpen} />
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 50px)' }}>
        <div
          style={{
            width: '80px',
            backgroundColor: '#eaeaea',
            height: 'calc(99vh - 50px)',
            float: 'left',
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
            marginLeft: '80px',
            zIndex: 2,
          }}
        >
          <Routes />
        </div>
      </div>
    </Fragment>
  );
}
