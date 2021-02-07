// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

export default {
  [SDKKinds.OnAppBasedLinkQuery]: {
    trigger: {
      submenu: {
        label: 'Teams',
        prompt: 'Which Teams event?',
        placeholder: 'Select a Teams event type',
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
      label: 'Messaging extension configuration - card button clicked',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationQuerySettingUrl]: {
    trigger: {
      label: 'Messaging extension configuration - on query setting url',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationSetting]: {
    trigger: {
      label: 'Messaging extension configuration - on setting',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionFetchTask]: {
    trigger: {
      label: 'Messaging extension - on fetch task',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionQuery]: {
    trigger: {
      label: 'Messaging extension - on query',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionSelectItem]: {
    trigger: {
      label: 'Messaging extension - on select item',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionSubmitAction]: {
    trigger: {
      label: 'Messaging extension - on submit action',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewEdit]: {
    trigger: {
      label: 'Messaging extension - on bot message preview edit',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewSend]: {
    trigger: {
      label: 'Messaging extension - on bot message preview send',
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
