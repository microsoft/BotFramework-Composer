import { useEffect, useContext } from 'react';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';

// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, editors, resetVisualEditor } = state;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getData', getData);
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('openSubEditor', openSubEditor);

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  useEffect(() => {
    if (editors.length >= 1 && resetVisualEditor) {
      var editorWindow = window.frames[editors[0].name];
      apiClient.apiCallAt('reset', files[index], editorWindow);

      actions.resetVisualEditor(false); // clear the flag
    }
  }, [resetVisualEditor]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    var targetEditor = editors.find(item => window.frames[item.name] == event.source);
    return targetEditor.data;
  }

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

  function openSubEditor({ data }) {
    // NOTE: before we have more spec on how muliple editors would render, open, close,
    //       we assume there are only two editors
    // TODO: enable sub editors to also create sub editors
    if (editors.length === 1) {
      createSecondEditor(data);
    } else {
      resetSecondEditor(data);
    }

    return 'window2';
  }

  // persist value change
  function handleValueChange(newFileObject, event) {
    const targetEditor = editors.find(item => window.frames[item.name] == event.source);

    if (targetEditor.parent !== 'window0') {
      // forward the data change
      apiClient.apiCallAt(
        'saveFromChild',
        { data: newFileObject, from: targetEditor.name },
        window.frames[targetEditor.parent]
      );
      return;
    }

    const payload = {
      name: files[openFileIndex].name,
      content: newFileObject.content,
    };

    actions.updateFile(payload);
  }
  return null;
}
