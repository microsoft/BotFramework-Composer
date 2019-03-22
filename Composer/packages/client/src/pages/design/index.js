import React, { useEffect, Fragment, useRef, useLayoutEffect, useContext } from 'react';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectExplorer } from './../../components/ProjectExplorer';
import ApiClient from './../../messenger/ApiClient';
import { Store } from './../../store/index';

// avoid recreate multiple times
const apiClient = new ApiClient();

function DesignPage() {
  // central state for all editors\extensions
  // this would serve as the fundation of layout\data exchange\message routing
  /* editor item
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

  const openFileIndexRef = useRef();
  const filesRef = useRef();
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, editors } = state;

  useEffect(() => {
    actions.fetchFiles();
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

  function createSecondEditor(data) {
    actions.addEditor({
      col: 1,
      row: 2,
      data: data,
      name: 'window2',
      parent: 'window1',
    });
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

    actions.updateFile(payload);
  }

  function handleFileClick(file, index) {
    // keep a ref because we want to read that from outside

    if (index === openFileIndex) {
      return;
    }

    actions.setOpenFileIndex(index);

    if (editors.length >= 1) {
      // reset the data in first window
      var editorWindow = window.frames[editors[0].name];
      apiClient.apiCallAt('reset', files[index], editorWindow);
    }

    actions.setEditor({
      col: 1,
      row: 1,
      data: files[index],
      name: 'window1',
      parent: 'window0', // shell
    });
  }

  return (
    <Fragment>
      <div />
      <div style={{ display: 'flex' }}>
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
            <div style={{ display: 'flex', flexDirection: 'row', height: '860px' }}>
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
    </Fragment>
  );
}

export default DesignPage;
