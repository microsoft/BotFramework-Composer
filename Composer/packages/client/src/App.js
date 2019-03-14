import React, { Fragment, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import Routes from './router';
import httpClient from './utils/http';
import { HeaderBar } from './components/HeaderBar/index';

initializeIcons(/* optional base url */);

const client = new httpClient();
export const AppContext = React.createContext(null);

export function App() {
  const [botStatus, setBotStatus] = useState('stopped');
  const [files, setFiles] = useState([]);

  function handleFileOpen(files) {
    if (files.length > 0) {
      const file = files[0];
      client.openbotFile(file.name, files => {
        if (files.length > 0) {
          setFiles(files);
        }
      });
    }
  }

  return (
    <Fragment>
      <Header client={client} botStatus={botStatus} setBotStatus={setBotStatus} onFileOpen={handleFileOpen} />
      <HeaderBar client={client} onFileOpen={handleFileOpen} />
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 50px)' }}>
        <div
          style={{
            width: '50px',
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
          <AppContext.Provider value={files}>
            <Routes />
          </AppContext.Provider>
        </div>
      </div>
    </Fragment>
  );
}
