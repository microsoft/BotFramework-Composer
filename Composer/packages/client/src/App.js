import React, { Fragment, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import Routes from './router';
import httpClient from './utils/http';
import { HeaderBar } from './components/HeaderBar/index';
import { BotButton } from './components/BotButton/index';

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
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 90px)' }}>
        <div
          style={{
            width: '50px',
            backgroundColor: '#eaeaea',
            height: 'calc(100vh - 90px)',
            float: 'left',
          }}
        >
          <NavItem to="/" iconName="EditNote" label="Design" />
          <NavItem to="/content" iconName="Code" label="Content" />
          <NavItem to="/setting" iconName="CollapseMenu" label="Settings" />
          <BotButton style={{ position: 'fixed', bottom: '15px', left: '10px' }} />
        </div>
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            marginLeft: '50px',
            zIndex: 2,
          }}
        >
          <AppContext.Provider value={files} style={{ height: '100%' }}>
            <Routes />
          </AppContext.Provider>
        </div>
      </div>
    </Fragment>
  );
}
