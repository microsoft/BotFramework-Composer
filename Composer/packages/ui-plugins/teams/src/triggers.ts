// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

export default {
  [SDKKinds.OnAppBasedLinkQuery]: {
    trigger: {
      submenu: {
        label: 'Teams',
        prompt: 'Which event?',
        placeholder: 'Select an event type',
      },
    },
  },
  [SDKKinds.OnCardAction]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnChannelCreated]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnChannelDeleted]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnChannelRenamed]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnChannelRestored]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnFileConsent]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionCardButtonClicked]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationQuerySettingUrl]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationSetting]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionFetchTask]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionQuery]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionSelectItem]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionSubmitAction]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnO365ConnectorCardAction]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTaskModuleFetch]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTaskModuleSubmit]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamArchived]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamDeleted]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamHardDeleted]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamRenamed]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamRestored]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamUnarchived]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewEdit]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewSend]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTabFetch]: {
    trigger: {
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTabSubmit]: {
    trigger: {
      submenu: 'Teams',
    },
  },
} as UISchema;
