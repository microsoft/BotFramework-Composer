export const BASEURL = 'http://localhost:5000/api';

export const ActionTypes = {
  PROJECT_STATE_INIT: 'PROJECT_STATE_INIT',
  PROJ_FILE_UPDATE_SUCCESS: 'PROJ_FILE_UPDATE_SUCCESS',
  PROJ_FILE_UPDATE_FAILURE: 'PROJ_FILE_UPDATE_FAILURE',
  FILES_GET: 'FILES_GET',
  FILES_GET_SUCCESS: 'FILES_GET_SUCCESS',
  FILES_GET_FAILURE: 'FILES_GET_FAILURE',
  FILES_UPDATE: 'FILES_UPDATE',
  FILES_UPDATE_FAILURE: 'FILES_UPDATE_FAILURE',
  OPEN_FILE_INDEX_SET: 'OPEN_FILE_INDEX_SET',
  BOT_STATUS_SET: 'BOT_STATUS_SET',
  BOT_STATUS_SET_FAILURE: 'BOT_STATUS_SET_FAILURE',
  EDITOR_ADD: 'EDITOR_ADD',
  EDITOR_SET: 'EDITOR_SET',
  STORAGE_GET: 'STORAGE_GET',
  STORAGE_GET_SUCCESS: 'STORAGE_GET_SUCCESS',
  STORAGE_GET_FAILURE: 'STORAGE_GET_FAILURE',
  STORAGEEXPLORER_STATUS_SET: 'STORAGEEXPLORER_STATUS_SET',
  STORAGEFILE_LOADING: 'STORAGEFILE_GET_LOADING',
  STORAGEFILE_GET_SUCCESS: 'STORAGEFILE_GET_SUCCESS',
  STORAGEFILE_GET_FAILURE: 'STORAGEFILE_GET_FAILURE',
  EDITOR_RESET_VISUAL: 'EDITOR_RESET_VISUAL',
  NAVIGATE_TO: 'NAVIGATE_TO',
  NAVIGATE_DOWN: 'NAVIGATE_DOWN',
  FOCUS_TO: 'FOCUS_TO',
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
