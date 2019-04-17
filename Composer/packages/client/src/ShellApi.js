import { useEffect, useContext, useRef, useMemo } from 'react';
import debounce from 'lodash.debounce';
import get from 'lodash.get';
import set from 'lodash.set';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
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

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.name] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  useEffect(() => {
    if (window.frames[0]) {
      const editorWindow = window.frames[0];
      const data = get(dialogsMap, navPath) || '';
      apiClient.apiCallAt('reset', { data, dialogs: dialogs, navPath: navPath }, editorWindow);
    }
  }, [dialogs, navPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      const data = get(dialogsMap, focusPath) || '';
      apiClient.apiCallAt('reset', { data, dialogs: dialogs, navPath: navPath }, editorWindow);
    }
  }, [dialogs, focusPath]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor' && navPath !== '') {
      return get(dialogsMap, navPath);
    } else if (sourceWindowName === 'FormEditor' && focusPath !== '') {
      return get(dialogsMap, focusPath);
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
      const updatedDialogs = set(dialogsMap, focusPath, newData);
      const dialogName = focusPath.split('.')[0];
      const payload = {
        name: dialogName,
        content: updatedDialogs[dialogName],
      };
      updateDialog(payload);

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
