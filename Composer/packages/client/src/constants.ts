// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  webAppRuntimeKey,
  functionsRuntimeKey,
  csharpFeedKey,
  nodeFeedKey,
  TeamsManifest,
} from '@botframework-composer/types';
import formatMessage from 'format-message';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

export const BASEPATH = process.env.PUBLIC_URL || '/';
export const BASEURL = `${process.env.PUBLIC_URL || ''}/api`;

//the count about the undo/redo
export const UNDO_LIMIT = 10;

export const Tips = {
  get PROJECT_NAME() {
    return formatMessage(
      `Create a name for the project which will be used to name the application: (projectname-environment-LUfilename)`
    );
  },
  get ENVIRONMENT() {
    return formatMessage(
      `When multiple people are working with models you want to be able to work with models independently from each other tied to the source control.`
    );
  },
  get AUTHORING_KEY() {
    return formatMessage('An authoring key is created automatically when you create a LUIS account.');
  },
  get SUBSCRIPTION_KEY() {
    return formatMessage('A subscription key is created when you create a QnA Maker resource.');
  },
  get AUTHORING_REGION() {
    return formatMessage('Authoring region to use (e.g. westus, westeurope, australiaeast)');
  },
  get QNA_REGION() {
    return formatMessage('Authoring region to use (westus)  (QnA maker resource location)');
  },
  get DEFAULT_LANGUAGE() {
    return formatMessage(
      `Configures default language model to use if there is no culture code in the file name (Default: en-us)`
    );
  },
};

export const LUIS_REGIONS: IDropdownOption[] = [
  {
    key: 'westus',
    text: formatMessage('westus'),
  },
  {
    key: 'westeurope',
    text: formatMessage('westeurope'),
  },
  {
    key: 'australiaeast',
    text: formatMessage('australiaeast'),
  },
];

export const Links = {
  LUIS: 'https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys?tabs=V2',
  QNA: 'https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/concepts/azure-resources#keys-in-qna-maker',
};

export const Text = {
  get DEPLOY() {
    return formatMessage(`Your bot is using LUIS and QNA for natural language understanding.`);
  },
  get LUISDEPLOY() {
    return formatMessage(
      `If you already have a LUIS account, provide the information below. If you do not have an account yet, create a (free) account first.`
    );
  },
  get QNADEPLOY() {
    return formatMessage(
      `If you already have a QNA account, provide the information below. If you do not have an account yet, create a (free) account first.`
    );
  },
  get LUISDEPLOYSUCCESS() {
    return formatMessage('Congratulations! Your model is successfully published.');
  },
  get LUISDEPLOYFAILURE() {
    return formatMessage('Sorry, something went wrong with publishing. Try again or exit out of this task.');
  },
  get CONNECTBOTFAILURE() {
    return formatMessage('Sorry, something went wrong with connecting bot runtime');
  },
  get DOTNETFAILURE() {
    return formatMessage('Composer needs .NET Core SDK');
  },
};

export enum LuisConfig {
  STORAGE_KEY = 'luisConfig',
  AUTHORING_KEY = 'authoringKey',
  ENVIRONMENT = 'environment',
  PROJECT_NAME = 'name',
  REGION = 'authoringRegion',
  LANGUAGE = 'defaultLanguage',
}

export enum QnaConfig {
  SUBSCRIPTION_KEY = 'subscriptionKey',
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
  queued = 'queued',
  connected = 'connected',
  inactive = 'inactive',
  publishing = 'publishing',
  published = 'published',
  starting = 'starting',
  pending = 'pending',
  failed = 'failed',
  stopping = 'stopping',
}

export enum CreationFlowStatus {
  NEW = 'New',
  NEW_FROM_SCRATCH = 'Scratch',
  NEW_FROM_TEMPLATE = 'Template',
  SAVEAS = 'Save as',
  OPEN = 'Open',
  CLOSE = 'Close',
}

export type CreationFlowType = 'Bot' | 'Skill';

export const Steps = {
  CREATE: 'CREATE',
  DEFINE: 'DEFINE',
  LOCATION: 'LOCATION',
  NONE: 'NONE',
};

export const BotStatusesCopy = {
  get connected() {
    return formatMessage('Running');
  },
  get publishing() {
    return formatMessage('Building');
  },
  get published() {
    return formatMessage('Starting');
  },
  get inactive() {
    return formatMessage('Inactive');
  },
  get failed() {
    return formatMessage('Failed');
  },
  get loading() {
    return formatMessage('Building');
  },
  get queued() {
    return formatMessage('Queued');
  },
  get starting() {
    return formatMessage('Starting');
  },
  get stopping() {
    return formatMessage('Stopping');
  },
  get pending() {
    return formatMessage('Status pending');
  },
};

export const DialogCreationCopy = {
  get CREATE_OPTIONS() {
    return {
      title: formatMessage('Open your Azure Bot resource'),
      subText: formatMessage('Do you want to create a new bot, or connect your Azure Bot resource to an existing bot?'),
    };
  },
  get CREATE_NEW_BOT() {
    return {
      title: formatMessage('Create bot from template or scratch?'),
      subText: formatMessage('You can create a new bot from scratch with Composer, or start with a template.'),
    };
  },
  get CREATE_NEW_BOT_V2() {
    return {
      title: formatMessage('Select a template'),
      subText: formatMessage("Microsoft's templates offer best practices for developing conversational bots."),
    };
  },
  get CREATE_NEW_SKILLBOT() {
    return {
      title: formatMessage('Create a skill in your bot'),
      subText: '',
    };
  },
  get DEFINE_CONVERSATION_OBJECTIVE() {
    return {
      title: formatMessage('Define conversation objective'),
      subText: formatMessage(
        `What can the user accomplish through this conversation? For example, BookATable, OrderACoffee etc.`
      ),
    };
  },
  get DEFINE_BOT_PROJECT() {
    return {
      title: formatMessage('Create a bot project'),
      subText: formatMessage(`Specify a name, description, and location for your new bot project.`),
    };
  },
  get DEFINE_DIALOG() {
    return {
      title: formatMessage('Create a dialog'),
      subText: formatMessage(`Specify a name and description for your new dialog.`),
    };
  },
  get SELECT_LOCATION() {
    return {
      title: formatMessage('Select a Bot'),
      subText: formatMessage('Which bot do you want to open?'),
    };
  },
  get SELECT_DESTINATION() {
    return {
      title: formatMessage('Set destination folder'),
      subText: formatMessage('Choose a location for your new bot project.'),
    };
  },
  get IMPORT_QNA() {
    return {
      title: formatMessage('Create New Knowledge Base'),
      subText: formatMessage(
        'Extract question-and-answer pairs from an online FAQ, product manuals, or other files. Supported formats are .tsv, .pdf, .doc, .docx, .xlsx, containing questions and answers in sequence. Learn more about knowledge base sources. Skip this step to add questions and answers manually after creation. The number of sources and file size you can add depends on the QnA service SKU you choose. Learn more about QnA Maker SKUs.'
      ),
    };
  },
  get IMPORT_BOT_PROJECT() {
    return {
      title: formatMessage('Import your bot to new project'),
      subText: formatMessage(`Specify a name, description, and location for your new bot project.`),
    };
  },
};

export const DialogDeleting = {
  get NO_LINKED_TITLE() {
    return formatMessage('This will delete the Dialog and its contents. Do you wish to continue?');
  },
  get TITLE() {
    return formatMessage('Warning!');
  },
  get CONTENT() {
    return formatMessage(
      `The dialog you have tried to delete is currently used in the below dialog(s). Removing this dialog will cause your Bot to malfunction without additional action.`
    );
  },
  get CONFIRM_CONTENT() {
    return formatMessage('Do you wish to continue?');
  },
};

export const MultiLanguagesDialog = {
  get ADD_DIALOG() {
    return {
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
    };
  },
  get DELETE_DIALOG() {
    return {
      title: formatMessage('Select language to delete'),
      subText: formatMessage(
        `When deleting a language, only the content will be removed. The flow and logic of the conversation and dialog will remain functional.`
      ),
    };
  },
};

export const addSkillDialog = {
  get SKILL_MANIFEST_FORM() {
    return {
      title: formatMessage('Add a skill'),
      subText: formatMessage('Enter a manifest url to add a new skill to your bot.'),
    };
  },
  get SKILL_MANIFEST_FORM_EDIT() {
    return {
      title: formatMessage('Edit a skill'),
      subText: formatMessage('Enter a manifest url to add a new skill to your bot.'),
    };
  },
};

export const repairSkillDialog = (name: string) => {
  return {
    title: formatMessage('Link to this skill has been broken'),
    subText: formatMessage('{name} cannot be found at the location.', { name }),
  };
};

export const removeSkillDialog = () => {
  return {
    title: formatMessage('Warning'),
    subText: formatMessage(
      'The skill you tried to remove from the project is currently used in the below bot(s). Removing this skill won’t delete the files, but it will cause your Bot to malfunction without additional action.'
    ),
    subTextNoUse: formatMessage(
      'You are about to remove the skill from this project. Removing this skill won’t delete the files.'
    ),
    footerText: formatMessage('Do you wish to continue?'),
  };
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

export const nameRegexV2 = /^[a-zA-Z0-9_]+$/;

export const invalidNameCharRegex = /[^a-z^A-Z^0-9^_]/g;

export const authConfig = {
  // for web login
  clientId: process.env.WEBLOGIN_CLIENTID,
  scopes: [
    'https://management.core.windows.net/user_impersonation',
    'https://graph.microsoft.com/Application.ReadWrite.All',
  ],
  tenantId: process.env.WEBLOGIN_TENANTID,
  redirectUrl: process.env.WEBLOGIN_REDIRECTURL,
};

export const armScopes = {
  scopes: ['https://management.core.windows.net/user_impersonation'],
  targetResource: 'https://management.core.windows.net/',
};
export const graphScopes = {
  scopes: ['https://graph.microsoft.com/Application.ReadWrite.All'],
  targetResource: 'https://graph.microsoft.com/',
};
export const vaultScopes = {
  scopes: ['https://vault.azure.net/user_impersonation'],
  targetResource: 'https://vault.azure.net/',
};

export const authUrl = `https://login.microsoftonline.com/${authConfig.tenantId}/oauth2/v2.0/authorize`;

export const triggerNotSupportedWarning = () =>
  formatMessage(
    'This trigger type is not supported by the RegEx recognizer. To ensure this trigger is fired, change the recognizer type.'
  );

export const firstPartyTemplateFeed =
  'https://registry.npmjs.org/-/v1/search?text=generator+keywords:bf-template+scope:microsoft'; // +maintainer:botframework

// TODO: replace language options with available languages pertinent to the selected template (issue #5554)
export const defaultPrimaryLanguage = 'english';

export const runtimeLanguageOptions: IDropdownOption[] = [
  { key: nodeFeedKey, text: 'Node' },
  { key: csharpFeedKey, text: 'Dot Net' },
];

export const defaultRuntime = 'azureWebApp';

export const runtimeOptions: IDropdownOption[] = [
  { key: webAppRuntimeKey, text: 'Azure Web App' },
  { key: functionsRuntimeKey, text: 'Azure Functions' },
];

export const onboardingDisabled = false;

export const defaultTeamsManifest: TeamsManifest = {
  $schema: 'https://developer.microsoft.com/en-us/json-schemas/teams/v1.9/MicrosoftTeams.schema.json',
  manifestVersion: '1.9',
  version: '1.0.0',
  id: '',
  packageName: '',
  developer: {
    name: 'contoso',
    websiteUrl: 'https://contoso.com',
    privacyUrl: 'https://cotoso.com/privacy',
    termsOfUseUrl: 'https://contoso.com/terms',
  },
  icons: {
    color: '',
    outline: '',
  },
  name: {
    short: '',
    full: '',
  },
  description: {
    short: '',
    full: '',
  },
  accentColor: '#FFFFFF',
  bots: [
    {
      botId: '',
      scopes: ['personal'],
    },
  ],
  permissions: ['identity', 'messageTeamMembers'],
  validDomains: ['token.botframework.com'],
};
