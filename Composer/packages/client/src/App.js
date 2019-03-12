import React, { useState, useEffect, Fragment, useRef, useLayoutEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { Tree } from './components/Tree';
import { Conversation } from './components/Conversation';
import './App.css';
import httpClient from './utils/http';
import { OpenFileModal } from './components/OpenFileModal';
import { ProjectExplorer } from './components/ProjectExplorer';
import ApiClient from './messenger/ApiClient';

initializeIcons(/* optional base url */);

// avoid recreate multiple times
const apiClient = new ApiClient();

function App() {
  // central state for all editors\extensions
  // this would serve as the fundation of layout\data exchange\message routing
  const [editors, setEditors] = useState([
    /* 
    {
      col: 1,
      row: 1,
      data: { 
        name: "main.dialog",
        content: "blabla"
      },
      name: "window1",
      parent: "window0(shell)"
    }
    */
  ]);

  const [files, setFiles] = useState([]);
  const [openFileIndex, setOpenFileIndex] = useState(-1);
  const [botStatus, setBotStatus] = useState('stopped');
  const [panelStatus, setPanelStatus] = useState(false);
  const openFileIndexRef = useRef();
  const filesRef = useRef();

  const client = new httpClient();

  useEffect(() => {
    client.getFiles(files => {
      if (files.length > 0) {
        setFiles(files);
      }
    });
  }, []);

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getData', getData);
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('openSubEditor', openSubEditor);

    return () => {
      apiClient.disconnect();
    };
  });

  useLayoutEffect(() => {
    openFileIndexRef.current = openFileIndex;
  });

  useLayoutEffect(() => {
    filesRef.current = files;
  });

  function openSubEditor(args) {
    var data = args.data; // data to open;

    setEditors([
      editors[0],
      {
        col: 1,
        row: 2,
        data: data,
        name: 'window2',
        parent: 'window1',
      },
    ]);

    return 'window2';
  }

  function getData(_, event) {
    //return filesRef.current[openFileIndexRef.current];

    var targetEditor = editors.find(item => window.frames[item.name] == event.source);
    return targetEditor.data;
  }

  function handleValueChange(newFileObject, event) {
    var targetEditor = editors.find(item => window.frames[item.name] == event.source);

    if (targetEditor.parent != 'window0') {
      // forward the data change
      apiClient.apiCallAt(
        'saveFromChild',
        { data: newFileObject, from: targetEditor.name },
        window.frames[targetEditor.parent]
      );
      return;
    }

    const currentIndex = openFileIndexRef.current;
    const files = filesRef.current;

    const payload = {
      name: files[currentIndex].name,
      content: newFileObject.content,
    };

    const newFiles = files.slice();
    newFiles[currentIndex].content = newFileObject.content;
    setFiles(newFiles);

    client.saveFile(payload);
  }

  function handleFileClick(file, index) {
    // keep a ref because we want to read that from outside

    if (index === openFileIndex) {
      return;
    }

    setOpenFileIndex(index);

    if (editors.length >= 1) {
      // reset the data in first window
      var editorWindow = window.frames[editors[0].name];
      apiClient.apiCallAt('reset', files[index], editorWindow);
    }

    setEditors([
      {
        col: 1,
        row: 1,
        data: files[index],
        name: 'window1',
        parent: 'window0', // shell
      },
    ]);
  }

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
      <Header
        client={client}
        botStatus={botStatus}
        setBotStatus={setBotStatus}
        onFileOpen={handleFileOpen}
        setPanelStatus={setPanelStatus}
      />
      <OpenFileModal panelStatus={panelStatus} setPanelStatus={setPanelStatus} />
      <div style={{ backgroundColor: '#f6f6f6', height: 'calc(100vh - 50px)' }}>
        <div
          style={{
            width: '80px',
            backgroundColor: '#eaeaea',
            height: 'calc(99vh - 50px)',
            float: 'left',
          }}
        >
          <NavItem iconName="SplitObject" label="Design" />
          <NavItem iconName="CollapseMenu" label="Content" />
          <NavItem iconName="Settings" label="Settings" />
        </div>
        <div
          style={{
            height: '100%',
            display: 'flex',
            overflow: 'auto',
            marginLeft: '80px',
            zIndex: 2,
          }}
        >
          <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
            <div>
              <Tree variant="large">
                <ProjectExplorer files={files} onClick={handleFileClick} />
              </Tree>
              <div style={{ height: '20px' }} />
              <Tree />
            </div>
          </div>
          <div style={{ flex: 4, marginTop: '20px', marginLeft: '20px' }}>
            <Conversation>
              <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                {editors.length > 0 &&
                  editors.map(item => {
                    return (
                      <iframe
                        key={item.name}
                        name={item.name}
                        style={{ height: '100%', width: '100%', border: '0px' }}
                        src="/extensionContainer.html"
                      />
                    );
                  })}
              </div>
            </Conversation>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
