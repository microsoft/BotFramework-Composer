import formatMessage from 'format-message';

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
  GET_PROJECT: 'GET_PROJECT',
  GET_PROJECT_SUCCESS: 'GET_PROJECT_SUCCESS',
  GET_PROJECT_FAILURE: 'GET_PROJECT_FAILURE',
  UPDATE_DIALOG: 'UPDATE_DIALOG',
  UPDATE_DIALOG_FAILURE: 'UPDATE_DIALOG_FAILURE',
  CREATE_DIALOG_SUCCESS: 'CREATE_DIALOG_SUCCESS',
  UPDATE_LG_SUCCESS: 'UPDATE_LG_SUCCESS',
  UPDATE_LG_FAILURE: 'UPDATE_LG_FAILURE',
  CREATE_LG_SUCCCESS: 'CREATE_LG_SUCCCESS',
  CREATE_LG_FAILURE: 'CREATE_LG_FAILURE',
  REMOVE_LG_SUCCCESS: 'REMOVE_LG_SUCCCESS',
  REMOVE_LG_FAILURE: 'REMOVE_LG_FAILURE',
  UPDATE_LU_SUCCESS: 'UPDATE_LU_SUCCESS',
  UPDATE_LU_FAILURE: 'UPDATE_LU_FAILURE',
  CREATE_LU_SUCCCESS: 'CREATE_LU_SUCCCESS',
  CREATE_LU_FAILURE: 'CREATE_LU_FAILURE',
  REMOVE_LU_SUCCCESS: 'REMOVE_LU_SUCCCESS',
  REMOVE_LU_FAILURE: 'REMOVE_LU_FAILURE',
  PUBLISH_LU_SUCCCESS: 'PUBLISH_LU_SUCCCESS',
  PUBLISH_LU_FAILURE: 'PUBLISH_LU_FAILURE',
  SET_BOT_STATUS_SUCCESS: 'SET_BOT_STATUS_SUCCESS',
  SET_BOT_STATUS_FAILURE: 'SET_BOT_STATUS_FAILURE',
  ADD_EDITOR: 'ADD_EDITOR',
  SET_EDITOR: 'SET_EDITOR',
  SET_STORAGE: 'SET_STORAGE',
  SAVE_TEMPLATE_ID: 'SAVE_TEMPLATE_ID',
  GET_STORAGE_SUCCESS: 'GET_STORAGE_SUCCESS',
  GET_STORAGE_FAILURE: 'GET_STORAGE_FAILURE',
  SET_STORAGEFILE_FETCHING_STATUS: 'SET_STORAGEFILE_FETCHING_STATUS',
  GET_STORAGEFILE_SUCCESS: 'GET_STORAGEFILE_SUCCESS',
  GET_STORAGEFILE_FAILURE: 'GET_STORAGEFILE_FAILURE',
  SET_CREATION_FLOW_STATUS: 'SET_CREATION_FLOW_STATUS',
  NAVIGATE_TO: 'NAVIGATE_TO',
  NAVIGATE_DOWN: 'NAVIGATE_DOWN',
  FOCUS_TO: 'FOCUS_TO',
  CLEAR_NAV_HISTORY: 'CLEAR_NAV_HISTORY',
  CONNECT_BOT_SUCCESS: 'CONNECT_BOT_SUCCESS',
  CONNECT_BOT_FAILURE: 'CONNECT_BOT_FAILURE',
  RELOAD_BOT_SUCCESS: 'RELOAD_BOT_SUCCESS',
  RELOAD_BOT_FAILURE: 'RELOAD_BOT_FAILURE',
};

export const Tips = {
  PROJECT_NAME: formatMessage(`Create a name for the project which will be used to name the application: 
    (projectname-environment-LUfilename)`),
  ENVIRONMENT: formatMessage(`When multiple people are working with models you want to be able to work with 
    models independently from each other tied to the source control.`),
  AUTHORING_KEY: formatMessage('An authoring key is created automatically when you create a LUIS account.'),
  AUTHORING_REGION: formatMessage('Authoring region to use [westus,westeurope,australiaeast]'),
  DEFAULT_LANGUAGE: formatMessage(
    `Configures default language model to use if there is no culture code in the file name (Default:en-us)`
  ),
};

export const Links = {
  LUIS: 'https://www.luis.ai/applications',
};

export const Text = {
  LUISDEPLOY: formatMessage(
    `To use your language model, first publish the latest intents and examples to your LUIS instance.`
  ),
  LUISDEPLOYSUCCESS: formatMessage('Congratulations! Your model is successfully published.'),
  LUISDEPLOYFAILURE: formatMessage('Sorry, something went wrong with publishing. Try again or exit out of this task.'),
};

export const LuisConfig = {
  STORAGE_KEY: 'luisConfig',
  AUTHORING_KEY: 'authoringKey',
  ENVIRONMENT: 'environment',
  PROJECT_NAME: 'name',
};

export const FileTypes = {
  FOLDER: 'folder',
  FILE: 'file',
  UNKNOW: 'unknow',
};

export const CreationFlowStatus = {
  NEW: 'New',
  NEW_FROM_SCRATCH: 'Scratch',
  NEW_FROM_TEMPLATE: 'Template',
  SAVEAS: 'Save as',
  OPEN: 'Open',
  CLOSE: '',
};

export const Steps = {
  CREATE: 'CREATE',
  DEFINE: 'DEFINE',
  LOCATION: 'LOCATION',
  NONE: 'NONE',
};

export const DialogInfo = {
  CREATE_NEW_BOT: {
    title: formatMessage('Create from scratch?'),
    subText: formatMessage('You can create a new bot from scratch with Designer, or start with a template.'),
  },
  DEFINE_CONVERSATION_OBJECTIVE: {
    title: formatMessage('Define conversation objective'),
    subText: formatMessage(
      `What can the user accomplish through this conversation? For example, book a table, order a coffee etc.`
    ),
  },
  SELECT_LOCATION: {
    title: formatMessage('Select a Bot'),
    subText: formatMessage('Which bot do you want to open?'),
  },
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
