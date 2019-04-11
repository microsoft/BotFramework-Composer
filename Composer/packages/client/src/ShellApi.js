import { useEffect, useContext, useRef } from 'react';
import debounce from 'lodash.debounce';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
import { query, update } from './utils/fileUtil';

// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, focusPath } = state;
  const updateDialog = useRef(debounce(actions.updateDialog, 500)).current;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getData', getData);
    apiClient.registerApi('getDialogs', getDialogs);
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('navDown', navDown);
    apiClient.registerApi('focusTo', focusTo);

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  useEffect(() => {
    if (window.frames[0]) {
      const editorWindow = window.frames[0];
      const data = query(dialogs, navPath);
      apiClient.apiCallAt('reset', { data, dialogs: dialogs }, editorWindow);
    }
  }, [dialogs, navPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      const data = query(dialogs, focusPath);
      apiClient.apiCallAt('reset', { data, dialogs: dialogs }, editorWindow);
    }
  }, [dialogs, focusPath]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor' && navPath !== '') {
      return query(dialogs, navPath);
    } else if (sourceWindowName === 'FormEditor' && focusPath !== '') {
      return query(dialogs, focusPath);
    }

    return '';
  }

  function getDialogs() {
    return dialogs;
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor') {
      return;
    } else if (sourceWindowName === 'FormEditor') {
      const updatedDialog = update(dialogs, focusPath, newData);
      updateDialog(updatedDialog);

      return true;
    }
  }

  function flushUpdates() {
    if (updateDialog.flush) {
      updateDialog.flush();
    }
  }

  function navTo({ path }) {
    flushUpdates();
    actions.navTo(path);
  }

  function navDown({ subPath }) {
    flushUpdates();
    actions.navDown(subPath);
  }

  function focusTo({ subPath }) {
    flushUpdates();
    actions.focusTo(subPath);
  }

  return null;
}
