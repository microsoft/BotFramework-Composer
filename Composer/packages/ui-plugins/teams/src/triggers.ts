// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

export default {
  [SDKKinds.OnAppBasedLinkQuery]: {
    trigger: {
      submenu: {
        label: formatMessage('Microsoft Teams'),
        prompt: formatMessage('Which Teams event?'),
        placeholder: formatMessage('Select a Teams event type'),
      },
    },
  },
  [SDKKinds.OnCardAction]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnChannelCreated]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnChannelDeleted]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnChannelRenamed]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnChannelRestored]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnFileConsent]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionCardButtonClicked]: {
    trigger: {
      label: formatMessage('Messaging extension - card button clicked'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationQuerySettingUrl]: {
    trigger: {
      label: formatMessage('Messaging extension - on query setting url'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionConfigurationSetting]: {
    trigger: {
      label: formatMessage('Messaging extension - configuration setting'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionFetchTask]: {
    trigger: {
      label: formatMessage('Messaging extension - on fetch task'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionQuery]: {
    trigger: {
      label: formatMessage('Messaging extension - on query'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionSelectItem]: {
    trigger: {
      label: formatMessage('Messaging extension - on select item'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionSubmitAction]: {
    trigger: {
      label: formatMessage('Messaging extension - on submit action'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewEdit]: {
    trigger: {
      label: formatMessage('Messaging extension - on bot message preview edit'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnMessagingExtensionBotMessagePreviewSend]: {
    trigger: {
      label: formatMessage('Messaging extension - on bot message preview send'),
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnO365ConnectorCardAction]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTaskModuleFetch]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTaskModuleSubmit]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamArchived]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamDeleted]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamHardDeleted]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamRenamed]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamRestored]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTeamUnarchived]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTabFetch]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
  [SDKKinds.OnTabSubmit]: {
    trigger: {
      submenu: formatMessage('Microsoft Teams'),
    },
  },
} as UISchema;
