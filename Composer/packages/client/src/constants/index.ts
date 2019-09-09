import formatMessage from 'format-message';

export const BASEPATH = process.env.PUBLIC_URL || '/';
export const BASEURL = `${process.env.PUBLIC_URL || 'http://localhost:5000'}/api`;

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

export enum ActionTypes {
  INIT_PROJECT_STATE = 'INIT_PROJECT_STATE',
  GET_PROJECT = 'GET_PROJECT',
  GET_PROJECT_SUCCESS = 'GET_PROJECT_SUCCESS',
  GET_PROJECT_FAILURE = 'GET_PROJECT_FAILURE',
  GET_RECENT_PROJECTS_SUCCESS = 'GET_RECENT_PROJECTS_SUCCESS',
  GET_RECENT_PROJECTS_FAILURE = 'GET_RECENT_PROJECTS_FAILURE',
  GET_TEMPLATE_PROJECTS_SUCCESS = 'GET_TEMPLATE_PROJECTS_SUCCESS',
  GET_TEMPLATE_PROJECTS_FAILURE = 'GET_TEMPLATE_PROJECTS_FAILURE',
  UPDATE_DIALOG = 'UPDATE_DIALOG',
  UPDATE_DIALOG_FAILURE = 'UPDATE_DIALOG_FAILURE',
  CREATE_DIALOG_BEGIN = 'CREATE_DIALOG_BEGIN',
  CREATE_DIALOG_CANCEL = 'CREATE_DIALOG_CANCEL',
  CREATE_DIALOG_SUCCESS = 'CREATE_DIALOG_SUCCESS',
  CREATE_DIALOG_FAILURE = 'CREATE_DIALOG_FAILURE',
  REMOVE_DIALOG_SUCCESS = 'REMOVE_DIALOG_SUCCESS',
  REMOVE_DIALOG_FAILURE = 'REMOVE_DIALOG_FAILURE',
  UPDATE_LG_SUCCESS = 'UPDATE_LG_SUCCESS',
  UPDATE_LG_FAILURE = 'UPDATE_LG_FAILURE',
  CREATE_LG_SUCCCESS = 'CREATE_LG_SUCCCESS',
  CREATE_LG_FAILURE = 'CREATE_LG_FAILURE',
  REMOVE_LG_SUCCCESS = 'REMOVE_LG_SUCCCESS',
  REMOVE_LG_FAILURE = 'REMOVE_LG_FAILURE',
  UPDATE_LU_SUCCESS = 'UPDATE_LU_SUCCESS',
  UPDATE_LU_FAILURE = 'UPDATE_LU_FAILURE',
  CREATE_LU_SUCCCESS = 'CREATE_LU_SUCCCESS',
  CREATE_LU_FAILURE = 'CREATE_LU_FAILURE',
  REMOVE_LU_SUCCCESS = 'REMOVE_LU_SUCCCESS',
  REMOVE_LU_FAILURE = 'REMOVE_LU_FAILURE',
  PUBLISH_LU_SUCCCESS = 'PUBLISH_LU_SUCCCESS',
  PUBLISH_LU_FAILURE = 'PUBLISH_LU_FAILURE',
  SET_BOT_STATUS_SUCCESS = 'SET_BOT_STATUS_SUCCESS',
  SET_BOT_STATUS_FAILURE = 'SET_BOT_STATUS_FAILURE',
  ADD_EDITOR = 'ADD_EDITOR',
  SET_EDITOR = 'SET_EDITOR',
  SET_STORAGE = 'SET_STORAGE',
  SAVE_TEMPLATE_ID = 'SAVE_TEMPLATE_ID',
  GET_STORAGE_SUCCESS = 'GET_STORAGE_SUCCESS',
  GET_STORAGE_FAILURE = 'GET_STORAGE_FAILURE',
  SET_STORAGEFILE_FETCHING_STATUS = 'SET_STORAGEFILE_FETCHING_STATUS',
  GET_STORAGEFILE_SUCCESS = 'GET_STORAGEFILE_SUCCESS',
  GET_STORAGEFILE_FAILURE = 'GET_STORAGEFILE_FAILURE',
  SET_CREATION_FLOW_STATUS = 'SET_CREATION_FLOW_STATUS',
  SET_DESIGN_PAGE_LOCATION = 'SET_DESIGN_PAGE_LOCATION',
  CONNECT_BOT_SUCCESS = 'CONNECT_BOT_SUCCESS',
  CONNECT_BOT_FAILURE = 'CONNECT_BOT_FAILURE',
  RELOAD_BOT_SUCCESS = 'RELOAD_BOT_SUCCESS',
  RELOAD_BOT_FAILURE = 'RELOAD_BOT_FAILURE',
  UPDATE_ENV_SETTING = 'UPDATE_ENV_SETTING',
  SYNC_ENV_SETTING = 'SYNC_ENV_SETTING',
  SET_ERROR = 'SET_ERROR',
  TO_START_BOT = 'TO_START_BOT',
  EDITOR_RESET_VISUAL = 'EDITOR_RESET_VISUAL',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE',
  USER_SESSION_EXPIRED = 'USER_SESSION_EXPIRED',
}

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
  CONNECTBOTFAILURE: formatMessage('Sorry, something went wrong with connecting bot runtime'),
};

export enum LuisConfig {
  STORAGE_KEY = 'luisConfig',
  AUTHORING_KEY = 'authoringKey',
  ENVIRONMENT = 'environment',
  PROJECT_NAME = 'name',
}

export const FileTypes = {
  FOLDER: 'folder',
  FILE: 'file',
  UNKNOW: 'unknow',
};

export enum BotStatus {
  connected = 'connected',
  unConnected = 'unConnected',
}

export enum CreationFlowStatus {
  NEW = 'New',
  NEW_FROM_SCRATCH = 'Scratch',
  NEW_FROM_TEMPLATE = 'Template',
  SAVEAS = 'Save as',
  OPEN = 'Open',
  CLOSE = 'Close',
}

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
      `What can the user accomplish through this conversation? For example, BookATable, OrderACoffee etc.`
    ),
  },
  SELECT_LOCATION: {
    title: formatMessage('Select a Bot'),
    subText: formatMessage('Which bot do you want to open?'),
  },
};

export const DialogDeleting = {
  NO_LINKED_TITLE: formatMessage('This action cannot be undone. Do you wish to continue?'),
  TITLE: formatMessage('Warning!'),
  CONTENT: formatMessage(
    `The dialog you have tried to delete is currently used in the below dialog(s). Removing this dialog will cause your Bot to malfunction without additional action.`
  ),
  CONFIRM_CONTENT: formatMessage('Do you wish to continue?'),
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

export const USER_TOKEN_STORAGE_KEY = 'composer.userToken';
export const SensitiveProperties = ['MicrosoftAppPassword', 'luis.authoringKey', 'luis.endpointKey'];
