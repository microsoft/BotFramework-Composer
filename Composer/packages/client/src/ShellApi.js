import { useEffect, useContext, useRef, useMemo } from 'react';
import { debounce } from 'lodash';

import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData } from './utils';
// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

const VISUAL_EDITOR = 'VisualEditor';
const FORM_EDITOR = 'FormEditor';

const isEventSourceValid = event => {
  const sourceWindowName = event.source.name;
  return [VISUAL_EDITOR, FORM_EDITOR].indexOf(sourceWindowName) !== -1;
};

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, focusPath, schemas, lgFiles, luFiles } = state;
  const updateDialog = useRef(debounce(actions.updateDialog, 750)).current;
  const updateLuFile = useRef(debounce(actions.updateLuFile, 750)).current;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 750)).current;
  const createLuFile = useRef(debounce(actions.createLuFile, 750)).current;
  const createLgFile = useRef(debounce(actions.createLgFile, 750)).current;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getState', (_, event) => getState(event.source.name));
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('updateLuFile', handleLuUpdate);
    apiClient.registerApi('updateLgFile', handleLgUpdate);
    apiClient.registerApi('createLuFile', handleLuCreate);
    apiClient.registerApi('createLgFile', handleLgCreate);
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
      apiClient.apiCallAt('reset', getState(VISUAL_EDITOR), editorWindow);
    }
  }, [dialogs, navPath, focusPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      apiClient.apiCallAt('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, focusPath]);

  // api to return the data should be showed in this window
  function getData(sourceWindow) {
    if (sourceWindow === VISUAL_EDITOR && navPath !== '') {
      return getDialogData(dialogsMap, navPath);
    } else if (sourceWindow === FORM_EDITOR && focusPath !== '') {
      return getDialogData(dialogsMap, focusPath);
    }

    return '';
  }

  function getState(sourceWindow) {
    return {
      data: getData(sourceWindow),
      dialogs,
      navPath,
      focusPath,
      schemas,
      lgFiles,
      luFiles,
    };
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;
    let path = '';
    switch (sourceWindowName) {
      case VISUAL_EDITOR:
        path = navPath;
        break;
      case FORM_EDITOR:
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
      dialogsMap[dialogName] = updatedDialog;
      updateDialog(payload);
    }

    //make sure focusPath always valid
    const data = getDialogData(dialogsMap, focusPath);
    if (typeof data === 'undefined') {
      actions.focusTo(navPath);
    }

    return true;
  }

  // create lu file
  function handleLuCreate(newData, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id: newData.id,
      content: newData.content,
    };

    createLuFile(payload);
    return true;
  }

  // create lg file
  function handleLgCreate(newData, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id: newData.id,
      content: newData.content,
    };

    createLgFile(payload);
    return true;
  }

  // update lu update
  function handleLuUpdate(newData, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id: newData.id,
      content: newData.content,
    };

    updateLuFile(payload);
    return true;
  }

  // update lg update
  function handleLgUpdate(newData, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id: newData.id,
      content: newData.content,
    };

    updateLgFile(payload);
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
    if (event.source.name === FORM_EDITOR) {
      path = focusPath;
    }
    actions.focusTo(path + subPath);
  }

  return null;
}
