import Path from 'path';

import jp from 'jsonpath';
import { useEffect, useContext, useMemo, useRef } from 'react';
import set from 'lodash.set';
import debounce from 'lodash.debounce';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';

// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, navPath, focusPath } = state;
  // use a ref to keep a ref to the debounced function across renders
  const updateFile = useRef(debounce(actions.updateFile, 500)).current;
  const { updateNavPathItems } = actions;

  // convert file to dialogs to use as a base to navPath and focusPath
  // TODO: create dialog api to return dialogs directly
  const dialogs = useMemo(
    () =>
      files.reduce(
        (result, item) => ({
          ...result,
          [Path.basename(item.name, '.dialog')]: JSON.parse(item.content),
        }),
        {}
      ),
    [files]
  );

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getData', getData);
    apiClient.registerApi('getDialogs', getDialogs);
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('navDown', navDown);
    apiClient.registerApi('focusTo', focusTo);
    apiClient.registerApi('flushToDisk', flushToDisk);

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  useEffect(() => {
    const editorWindow = window.frames[0];
    const data = navPath === '' ? '' : jp.query(dialogs, navPath)[0];
    apiClient.apiCallAt('reset', data, editorWindow);
    if (data !== '') updateNavPathItems(navPath, data.$type);
  }, [dialogs, navPath]);

  useEffect(() => {
    const editorWindow = window.frames[1];
    const data = focusPath === '' ? '' : jp.query(dialogs, focusPath)[0];
    apiClient.apiCallAt('reset', data, editorWindow);
    if (data !== '') updateNavPathItems(focusPath, data.$type);
  }, [dialogs, focusPath]);

  // api to return the data should be showed in this window
  function getData(_, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor' && navPath !== '') {
      return jp.query(dialogs, navPath)[0];
    } else if (sourceWindowName === 'FormEditor' && focusPath !== '') {
      return jp.query(dialogs, focusPath)[0];
    }

    return '';
  }

  function getDialogs() {
    return files;
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;

    if (sourceWindowName === 'VisualEditor') {
      return;
    } else if (sourceWindowName === 'FormEditor') {
      // TODO: use jsonpath to form a new version of dialogData, and update
      const updatedContent = set({ ...dialogs }, focusPath, newData);
      const dialogName = Path.basename(files[openFileIndex].name, '.dialog');
      const payload = {
        name: files[openFileIndex].name,
        content: JSON.stringify(updatedContent[dialogName]),
      };
      // TODO: save this gracefully
      // current newData has some field sets to undefined, which is not friendly to runtime
      updateFile(payload);

      return true;
    }
  }

  function flushToDisk() {
    if (updateFile.flush) {
      updateFile.flush();
    }
  }

  function navTo({ path }) {
    actions.navTo(path);
  }

  function navDown({ subPath }) {
    actions.navDown(subPath);
  }

  function focusTo({ subPath }) {
    actions.focusTo(subPath);
  }

  return null;
}
