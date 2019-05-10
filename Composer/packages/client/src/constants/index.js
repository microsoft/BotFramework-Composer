export const BASEURL = 'http://localhost:5000/api';

/**
 * Global ActionTypes Defination Instruction.
 * For unification consideration, please follow the naming pattern below
 * You may not need all of this types. but the type must be one of them.
 * Shortly, a good ActionType name should be:
 * <DO_WHAT_STATUS> or <DO_WHAT>
 *
 * <DO>
 * e.g. 'GET' / 'SET' / 'FETCH' / 'UPDATE' / 'CREATE' etc.
 *
 * <DO_WHAT>
 * usage example, 'GET_DATA' / 'UPDATE_FILE' / 'SET_STATE'
 *
 * <STATUS>
 * START ---> SUCCESS || FAILURE ---> COMPLETE
 * it's a status flow, <STATUS> must be one of them
 * complete is fired no mater it's success or failure.
 * usage example, 'GET_DATA_SUCCESS' / 'UPDATE_FILE_FAILURE' / 'SET_STATE_COMPLETE'
 *
 * Bad Practices:
 * - Reversed <WHAT_DO>, e.g. 'DATA_GET', 'FILE_SET'
 * - ACTION use as ACTION_SUCCESS
 * - Have SUCCESS but no FAILURE
 * - Overdesign, unused types
 */

export const ActionTypes = {
  INIT_PROJECT_STATE: 'INIT_PROJECT_STATE',
  UPDATE_PROJFILE__SUCCESS: 'UPDATE_PROJFILE__SUCCESS',
  UPDATE_PROJFILE__FAILURE: 'UPDATE_PROJFILE__FAILURE',
  GET_PROJECT: 'GET_PROJECT',
  GET_PROJECT_SUCCESS: 'GET_PROJECT_SUCCESS',
  GET_PROJECT_FAILURE: 'GET_PROJECT_FAILURE',
  UPDATE_DIALOG: 'UPDATE_DIALOG',
  UPDATE_DIALOG_FAILURE: 'UPDATE_DIALOG_FAILURE',
  CREATE_DIALOG_SUCCESS: 'CREATE_DIALOG_SUCCESS',
  UPDATE_LG_TEMPLATE_STATE: 'UPDATE_LG_TEMPLATE_STATE',
  UPDATE_LG_SUCCESS: 'UPDATE_LG_SUCCESS',
  UPDATE_LG_FAILURE: 'UPDATE_LG_FAILURE',
  CREATE_LG_SUCCCESS: 'CREATE_LG_SUCCCESS',
  CREATE_LG_FAILURE: 'CREATE_LG_FAILURE',
  SET_BOT_STATUS_SUCCESS: 'SET_BOT_STATUS_SUCCESS',
  SET_BOT_STATUS_FAILURE: 'SET_BOT_STATUS_FAILURE',
  ADD_EDITOR: 'ADD_EDITOR',
  SET_EDITOR: 'SET_EDITOR',
  SET_STORAGE: 'SET_STORAGE',
  GET_STORAGE_SUCCESS: 'GET_STORAGE_SUCCESS',
  GET_STORAGE_FAILURE: 'GET_STORAGE_FAILURE',
  SET_STORAGEEXPLORER_STATUS: 'SET_STORAGEEXPLORER_STATUS',
  SET_STORAGEFILE_FETCHING_STATUS: 'SET_STORAGEFILE_FETCHING_STATUS',
  GET_STORAGEFILE_SUCCESS: 'GET_STORAGEFILE_SUCCESS',
  GET_STORAGEFILE_FAILURE: 'GET_STORAGEFILE_FAILURE',
  NAVIGATE_TO: 'NAVIGATE_TO',
  NAVIGATE_DOWN: 'NAVIGATE_DOWN',
  FOCUS_TO: 'FOCUS_TO',
  CLEAR_NAV_HISTORY: 'CLEAR_NAV_HISTORY',
};

export const FileTypes = {
  FOLDER: 'folder',
  FILE: 'file',
  UNKNOW: 'unknow',
};

export const SupportedFileTypes = [
  'accdb',
  'csv',
  'docx',
  'dotx',
  'mpt',
  'odt',
  'one',
  'onepkg',
  'onetoc',
  'pptx',
  'pub',
  'vsdx',
  'xls',
  'xlsx',
  'xsn',
];
