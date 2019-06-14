import { useEffect, useContext, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import { navigate } from '@reach/router';

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

const useDebouncedFunc = (fn, delay = 750) => useRef(debounce(fn, delay)).current;

const FileChangeTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const FileTargetTypes = {
  LU: 'lu',
  LG: 'lg',
};

const shellNavigator = (shellPage, opts = {}) => {
  switch (shellPage) {
    case 'lu':
      navigate(`/language-understanding/${opts.id}`);
      return;
    default:
      return;
  }
};

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, focusPath, schemas, lgFiles, luFiles } = state;
  const updateDialog = useDebouncedFunc(actions.updateDialog);
  const updateLuFile = useDebouncedFunc(actions.updateLuFile);
  const updateLgFile = useDebouncedFunc(actions.updateLgFile);
  const createLuFile = actions.createLuFile;
  const createLgFile = actions.createLgFile;

  const { LG, LU } = FileTargetTypes;
  const { CREATE, UPDATE } = FileChangeTypes;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getState', (_, event) => getState(event.source.name));
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('updateLuFile', fileHandler(LU, UPDATE));
    apiClient.registerApi('updateLgFile', fileHandler(LG, UPDATE));
    apiClient.registerApi('createLuFile', fileHandler(LU, CREATE));
    apiClient.registerApi('createLgFile', fileHandler(LG, CREATE));
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('navDown', navDown);
    apiClient.registerApi('focusTo', focusTo);
    apiClient.registerApi('shellNavigate', ({ shellPage, opts }) => shellNavigator(shellPage, opts));

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
  }, [dialogs, lgFiles, luFiles, navPath, focusPath]);

  useEffect(() => {
    if (window.frames[1]) {
      const editorWindow = window.frames[1];
      apiClient.apiCallAt('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, navPath, focusPath]);

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

  function fileHandler(fileTargetType, fileChangeType) {
    return async (newData, event) => {
      if (isEventSourceValid(event) === false) return false;

      const payload = {
        id: newData.id,
        content: newData.content,
      };

      switch ([fileTargetType, fileChangeType].join(',')) {
        case [LU, UPDATE].join(','):
          await updateLuFile(payload);
          break;

        case [LG, UPDATE].join(','):
          await updateLgFile(payload);
          break;

        case [LU, CREATE].join(','):
          await createLuFile(payload);
          break;

        case [LG, CREATE].join(','):
          await createLgFile(payload);
          break;
        default:
          throw new Error(`unsupported method ${fileTargetType} - ${fileChangeType}`);
      }
      return true;
    };
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
