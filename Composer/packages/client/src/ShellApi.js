import { useEffect, useContext, useRef, useMemo } from 'react';
import { debounce, get } from 'lodash';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData } from './utils';
// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, focusPath, schemas } = state;
  const updateDialog = useRef(debounce(actions.updateDialog, 750)).current;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getState', getState);
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
      const data = getDialogData(dialogsMap, navPath) || '';
      apiClient.apiCallAt('reset', { data, dialogs, navPath, focusPath }, editorWindow);
    }
  }, [dialogs, navPath, focusPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      const data = getDialogData(dialogsMap, focusPath) || '';
      apiClient.apiCallAt('reset', { data, dialogs, navPath, focusPath }, editorWindow);
    }
  }, [dialogs, focusPath]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor' && navPath !== '') {
      return getDialogData(dialogsMap, navPath);
    } else if (sourceWindowName === 'FormEditor' && focusPath !== '') {
      return getDialogData(dialogsMap, focusPath);
    }

    return '';
  }

  function getState(...args) {
    return {
      data: getData(...args),
      dialogs,
      navPath,
      focusPath,
      schemas,
    };
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;
    let path = '';
    switch (sourceWindowName) {
      case 'VisualEditor':
        path = navPath;
        break;
      case 'FormEditor':
        path = focusPath;
        break;
      default:
        path = '';
        break;
    }

    if (path !== '') {
      const updatedDialog = setDialogData(dialogsMap, path, newData);
      const dialogName = path.split('#')[0];
      const payload = { name: dialogName, content: updatedDialog };
      updateDialog(payload);

      if (sourceWindowName === 'VisualEditor') {
        const data = get(updatedDialog, focusPath.split('#')[1]);
        if (typeof data === 'undefined') {
          actions.focusTo('');
        }
      }
    }
    return true;
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

  function focusTo({ subPath }, event) {
    flushUpdates();
    let path = navPath;
    if (event.source.name === 'FormEditor') {
      path = focusPath;
    }
    actions.focusTo(path + subPath);
  }

  return null;
}
