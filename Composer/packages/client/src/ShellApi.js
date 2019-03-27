import Path from 'path';

import jp from 'jsonpath';
import { useEffect, useContext } from 'react';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';

// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, resetVisualEditor, resetFormEditor, navPath, focusPath } = state;

  // convert file to dialogs to use as a base to navPath and focusPath
  // TODO: create dialog api to return dialogs directly
  const dialogs = files.reduce(
    (result, item) => ({
      ...result,
      [Path.basename(item.name, '.dialog')]: JSON.parse(item.content),
    }),
    {}
  );

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getData', getData);
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('navDown', navDown);
    apiClient.registerApi('focusTo', focusTo);

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  useEffect(() => {
    if (navPath !== '' && resetVisualEditor) {
      var editorWindow = window.frames[0];
      apiClient.apiCallAt('reset', jp.query(dialogs, navPath)[0], editorWindow);

      actions.resetVisualEditor(false); // clear the flag
    }
  }, [resetVisualEditor]);

  useEffect(() => {
    if (focusPath !== '' && resetFormEditor) {
      var editorWindow = window.frames[1];
      apiClient.apiCallAt('reset', jp.query(dialogs, focusPath)[0], editorWindow);

      actions.resetFormEditor(false); // clear the flag
    }
  }, [resetFormEditor]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor') {
      return jp.query(dialogs, navPath)[0];
    } else if (sourceWindowName === 'FormEditor') {
      return jp.query(dialogs, focusPath)[0];
    }
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor') {
      return;
    } else if (sourceWindowName === 'FormEditor') {
      console.log(newData);
      // TODO: use jsonpath to form a new version of dialogData, and update
      const payload = {
        name: files[openFileIndex].name,
        content: newData,
      };
      console.log(payload);
      //actions.updateFile(payload);
      return true;
    }
  }

  function navTo({ path }) {
    actions.navTo(path);
  }

  function navDown({ subPath }) {
    actions.focusTo(subPath);
  }

  function focusTo({ subPath }) {
    actions.focusTo(subPath);
  }

  return null;
}
