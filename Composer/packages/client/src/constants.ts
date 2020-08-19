// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const BASEPATH = process.env.PUBLIC_URL || '/';
export const BASEURL = `${process.env.PUBLIC_URL || ''}/api`;

//the count about the undo/redo
export const UNDO_LIMIT = 10;

export const Tips = {
  PROJECT_NAME: formatMessage(
    `Create a name for the project which will be used to name the application: (projectname-environment-LUfilename)`
  ),
  ENVIRONMENT: formatMessage(
    `When multiple people are working with models you want to be able to work with models independently from each other tied to the source control.`
  ),
  AUTHORING_KEY: formatMessage('An authoring key is created automatically when you create a LUIS account.'),
  AUTHORING_REGION: formatMessage('Authoring region to use (e.g. westus, westeurope, australiaeast)'),
  DEFAULT_LANGUAGE: formatMessage(
    `Configures default language model to use if there is no culture code in the file name (Default: en-us)`
  ),
};

export const Links = {
  LUIS: 'https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys?tabs=V2',
};

export const Text = {
  LUISDEPLOY: formatMessage(
    `Your bot is using LUIS for natural language understanding. If you already have a LUIS account, provide the information below. If you do not have an account yet, create a (free) account first.`
  ),
  LUISDEPLOYSUCCESS: formatMessage('Congratulations! Your model is successfully published.'),
  LUISDEPLOYFAILURE: formatMessage('Sorry, something went wrong with publishing. Try again or exit out of this task.'),
  CONNECTBOTFAILURE: formatMessage('Sorry, something went wrong with connecting bot runtime'),
  DOTNETFAILURE: formatMessage('Composer needs .NET Core SDK'),
};

export enum LuisConfig {
  STORAGE_KEY = 'luisConfig',
  AUTHORING_KEY = 'authoringKey',
  ENVIRONMENT = 'environment',
  PROJECT_NAME = 'name',
  REGION = 'authoringRegion',
  LANGUAGE = 'defaultLanguage',
}

export const FileTypes = {
  FOLDER: 'folder',
  FILE: 'file',
  BOT: 'bot',
  UNKNOWN: 'unknown',
};

export const OpenStatus = {
  NEW: 'New',
  SAVEAS: 'Save as',
  OPEN: 'Open',
  CLOSE: '',
};

export enum BotStatus {
  connected = 'connected',
  unConnected = 'unConnected',
  publishing = 'publishing',
  published = 'published',
  reloading = 'loading',
  pending = 'pending',
  failed = 'failed',
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

export const DialogCreationCopy = {
  CREATE_NEW_BOT: {
    title: formatMessage('Create bot from template or scratch?'),
    subText: formatMessage('You can create a new bot from scratch with Composer, or start with a template.'),
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
  SELECT_DESTINATION: {
    title: formatMessage('Set destination folder'),
    subText: formatMessage('Choose a location for your new bot project.'),
  },
};

export const DialogDeleting = {
  NO_LINKED_TITLE: formatMessage('This will delete the Dialog and its contents. Do you wish to continue?'),
  TITLE: formatMessage('Warning!'),
  CONTENT: formatMessage(
    `The dialog you have tried to delete is currently used in the below dialog(s). Removing this dialog will cause your Bot to malfunction without additional action.`
  ),
  CONFIRM_CONTENT: formatMessage('Do you wish to continue?'),
};

export const MultiLanguagesDialog = {
  ADD_DIALOG: {
    title: formatMessage('Copy content for translation'),
    subText: formatMessage(
      `Composer cannot yet translate your bot automatically.\nTo create a translation manually, Composer will create a copy of your bot’s content with the name of the additional language. This content can then be translated without affecting the original bot logic or flow and you can switch between languages to ensure the responses are correctly and appropriately translated.`
    ),
    selectDefaultLangTitle: formatMessage(
      'This language will be copied and used as the basis (and fallback language) for the translation.'
    ),
    selectionTitle: formatMessage('To which language will you be translating your bot?'),
    searchPlaceHolder: formatMessage('Search'),
    whenDoneText: formatMessage(
      'When done, switch to the newly created language and start the (manual) translation process.'
    ),
  },
  DELETE_DIALOG: {
    title: formatMessage('Select language to delete'),
    subText: formatMessage(
      `When deleting a language, only the content will be removed. The flow and logic of the conversation and dialog will remain functional.`
    ),
  },
};

export const addSkillDialog = {
  SKILL_MANIFEST_FORM: {
    title: formatMessage('Add a skill'),
    subText: formatMessage('Enter a manifest url to add a new skill to your bot.'),
  },
  SKILL_MANIFEST_FORM_EDIT: {
    title: formatMessage('Edit a skill'),
    subText: formatMessage('Enter a manifest url to add a new skill to your bot.'),
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

export const USER_TOKEN_STORAGE_KEY = 'composer.userToken';

export enum AppUpdaterStatus {
  IDLE,
  UPDATE_AVAILABLE,
  UPDATE_UNAVAILABLE,
  UPDATE_IN_PROGRESS,
  UPDATE_FAILED,
  UPDATE_SUCCEEDED,
}

export const EmptyBotTemplateId = 'EmptyBot';

export const nameRegex = /^[a-zA-Z0-9-_]+$/;
