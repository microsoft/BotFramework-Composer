import { useEffect, useContext, useMemo, useRef } from 'react';
import set from 'lodash.set';
import debounce from 'lodash.debounce';
import map from 'lodash.map';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
import { getBaseName } from './utils';
// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogFiles, openedDialogIndex, navPath, focusPath } = state;
  const updateFile = useRef(debounce(actions.updateFile, 500)).current;

  // convert file to dialogs to use as a base to navPath and focusPath
  // TODO: create dialog api to return dialogs directly
  const dialogs = useMemo(
    () =>
      dialogFiles.reduce(
        (result, item) => ({
          ...result,
          [getBaseName(item.name)]: item.content,
        }),
        {}
      ),
    [dialogFiles]
  );

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
      const data = navPath === '' ? '' : map({ dialogs }, navPath)[0];
      apiClient.apiCallAt('reset', { data, dialogs: dialogFiles }, editorWindow);
    }
  }, [dialogFiles, navPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      const data = focusPath === '' ? '' : map({ dialogs }, focusPath)[0];
      apiClient.apiCallAt('reset', { data, dialogs: dialogFiles }, editorWindow);
    }
  }, [dialogFiles, focusPath]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor' && navPath !== '') {
      return map({ dialogs }, navPath)[0];
    } else if (sourceWindowName === 'FormEditor' && focusPath !== '') {
      return map({ dialogs }, focusPath)[0];
    }

    return '';
  }

  function getDialogs() {
    return dialogFiles;
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor') {
      return;
    } else if (sourceWindowName === 'FormEditor') {
      // TODO: use jsonpath to form a new version of dialogData, and update
      const updatedContent = set({ ...dialogs }, focusPath, newData);
      const dialogName = getBaseName(dialogFiles[openedDialogIndex].name);
      const payload = {
        name: dialogFiles[openedDialogIndex].name,
        content: updatedContent[dialogName],
      };
      updateFile(payload);

      return true;
    }
  }

  function flushUpdates() {
    if (updateFile.flush) {
      updateFile.flush();
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
