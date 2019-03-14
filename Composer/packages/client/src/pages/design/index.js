/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, Fragment, useRef, useLayoutEffect, useContext } from 'react';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import httpClient from './../../utils/http';
import { ProjectExplorer } from './../../components/ProjectExplorer';
import ApiClient from './../../messenger/ApiClient';
import { AppContext } from './../../App';
import { container, treeContainer, division, conversationContainer, extension } from './styles';

// avoid recreate multiple times
const apiClient = new ApiClient();

const client = new httpClient();

function DesignPage() {
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
  const openFileIndexRef = useRef();
  const filesRef = useRef();
  const newOpenFiles = useContext(AppContext);

  useEffect(() => {
    client.getFiles(files => {
      if (files.length > 0) {
        setFiles(files);
      }
    });
  }, []);

  useEffect(() => {
    if (newOpenFiles.length > 0) {
      setFiles(newOpenFiles);
    }
  }, [newOpenFiles]);

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

  function createSecondEditor(data) {
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
  }

  function resetSecondEditor(data) {
    apiClient.apiCallAt('reset', data, window.frames['window2']);
  }

  function openSubEditor(args) {
    var data = args.data; // data to open;

    // NOTE: before we have more spec on how muliple editors would render, open, close,
    //       we assume there are only two editors
    // TODO: enable sub editors to also create sub editors
    if (editors.length == 1) {
      createSecondEditor(data);
    } else {
      resetSecondEditor(data);
    }

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

  return (
    <Fragment>
      <div css={container}>
        <div css={treeContainer}>
          <Tree style={{ flex: '1.2 1.2 auto' }}>
            <ProjectExplorer files={files} onClick={handleFileClick} />
          </Tree>
          <div css={division} />
          <Tree style={{ flex: '1 1 auto' }} />
        </div>
        <div css={conversationContainer}>
          {editors.length > 0 &&
            editors.map(item => {
              return (
                <Conversation key={item.name} style={{ flex: 1, marginRight: '15px' }}>
                  <iframe key={item.name} name={item.name} css={extension} src="/extensionContainer.html" />
                </Conversation>
              );
            })}
        </div>
      </div>
    </Fragment>
  );
}

export default DesignPage;
