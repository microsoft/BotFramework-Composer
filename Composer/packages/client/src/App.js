import React, { Fragment, useContext } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import Routes from './router';
import { Store } from './store/index';
import { fetchFilesByOpen, toggleBot } from './store/action';

initializeIcons(/* optional base url */);

export function App() {
  const { state, bindActions } = useContext(Store);
  const { botStatus } = state;
  const actions = bindActions({ fetchFilesByOpen, toggleBot });

  function handleFileOpen(files) {
    if (files.length > 0) {
      const file = files[0];
      actions.fetchFilesByOpen(file.name);
    }
  }

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        setBotStatus={status => {
          actions.toggleBot(status);
        }}
        onFileOpen={handleFileOpen}
      />
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 50px)' }}>
        <div
          style={{
            width: '80px',
            backgroundColor: '#eaeaea',
            height: 'calc(99vh - 50px)',
            float: 'left',
          }}
        >
          <NavItem to="/" iconName="SplitObject" label="Design" />
          <NavItem to="/content" iconName="CollapseMenu" label="Content" />
          <NavItem to="/setting" iconName="Settings" label="Settings" />
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
