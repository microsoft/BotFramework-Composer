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
 * - Overdesign, unused types
 */

export const ActionTypes = {
  PROJECT_STATE_INIT: 'PROJECT_STATE_INIT',
  PROJ_FILE_UPDATE_SUCCESS: 'PROJ_FILE_UPDATE_SUCCESS',
  PROJ_FILE_UPDATE_FAILURE: 'PROJ_FILE_UPDATE_FAILURE',
  GET_PROJECT: 'GET_PROJECT',
  GET_PROJECT_SUCCESS: 'GET_PROJECT_SUCCESS',
  GET_PROJECT_FAILURE: 'GET_PROJECT_FAILURE',
  UPDATE_DIALOG: 'UPDATE_DIALOG',
  UPDATE_DIALOG_FAILURE: 'UPDATE_DIALOG_FAILURE',
  CREATE_DIALOG_SUCCESS: 'CREATE_DIALOG_SUCCESS',
  UPDATE_LG_TEMPLATE_STATE: 'UPDATE_LG_TEMPLATE_STATE',
  UPDATE_LG_TEMPLATE: 'UPDATE_LG_TEMPLATE',
  UPDATE_LG_FAILURE: 'UPDATE_LG_FAILURE',
  CREATE_LG_SUCCCESS: 'CREATE_LG_SUCCCESS',
  CREATE_LG_FAILURE: 'CREATE_LG_FAILURE',
  BOT_STATUS_SET: 'BOT_STATUS_SET',
  BOT_STATUS_SET_FAILURE: 'BOT_STATUS_SET_FAILURE',
  EDITOR_ADD: 'EDITOR_ADD',
  EDITOR_SET: 'EDITOR_SET',
  STORAGE_GET: 'STORAGE_GET',
  STORAGE_GET_SUCCESS: 'STORAGE_GET_SUCCESS',
  STORAGE_GET_FAILURE: 'STORAGE_GET_FAILURE',
  STORAGEEXPLORER_STATUS_SET: 'STORAGEEXPLORER_STATUS_SET',
  SET_STORAGEFILE_FETCHING_STATUS: 'SET_STORAGEFILE_FETCHING_STATUS',
  STORAGEFILE_GET_SUCCESS: 'STORAGEFILE_GET_SUCCESS',
  STORAGEFILE_GET_FAILURE: 'STORAGEFILE_GET_FAILURE',
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
