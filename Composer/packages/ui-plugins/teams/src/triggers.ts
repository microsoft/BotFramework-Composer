// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

export default {
  [SDKKinds.OnTeamsAppBasedLinkQuery]: {
    trigger: {
      label: 'On app based link query',
      submenu: {
        label: 'Teams',
        prompt: 'Which event?',
        placeholder: 'Select an event type',
      },
    },
  },
  [SDKKinds.OnTeamsCardAction]: {
    trigger: {
      label: 'Card action',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsChannelCreated]: {
    trigger: {
      label: 'Channel created',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsChannelDeleted]: {
    trigger: {
      label: 'Channel deleted',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsChannelRenamed]: {
    trigger: {
      label: 'Channel renamed',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsChannelRestored]: {
    trigger: {
      label: 'Channel restored',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsFileConsent]: {
    trigger: {
      label: 'File consent',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionCardButtonClicked]: {
    trigger: {
      label: 'Messaging extension card button clicked',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionConfigurationQuerySettingUrl]: {
    trigger: {
      label: 'Messaging extension configuration query setting url',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionConfigurationSetting]: {
    trigger: {
      label: 'Messaging extension configuration setting',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionFetchTask]: {
    trigger: {
      label: 'Messaging extension fetch task',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionQuery]: {
    trigger: {
      label: 'Messaging extension query',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionSelectItem]: {
    trigger: {
      label: 'Messaging extension select item',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionSubmitAction]: {
    trigger: {
      label: 'Messaging extension submit action',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsO365ConnectorCardAction]: {
    trigger: {
      label: 'O365 connector card action',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTaskModuleFetch]: {
    trigger: {
      label: 'Task module fetch',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTaskModuleSubmit]: {
    trigger: {
      label: 'Task module submit',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamArchived]: {
    trigger: {
      label: 'Team archived',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamDeleted]: {
    trigger: {
      label: 'Team deleted',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamHardDeleted]: {
    trigger: {
      label: 'Team hard deleted',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamRenamed]: {
    trigger: {
      label: 'Team Renamed',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamRestored]: {
    trigger: {
      label: 'Team restored',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTeamUnarchived]: {
    trigger: {
      label: 'Team unarchived',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionBotMessagePreviewEdit]: {
    trigger: {
      label: 'Messaging extension bot message preview edit',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsMessagingExtensionBotMessagePreviewSend]: {
    trigger: {
      label: 'Messaging extension bot message preview send',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTabFetch]: {
    trigger: {
      label: 'Tab fetch',
      submenu: 'Teams',
    },
  },
  [SDKKinds.OnTeamsTabSubmit]: {
    trigger: {
      label: 'Tab submit',
      submenu: 'Teams',
    },
  },
} as UISchema;
