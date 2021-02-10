// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

export default {
  [SDKKinds.GetMeetingParticipant]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetMember]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetPagedMembers]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetPagedTeamMembers]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamChannels]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamDetails]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamMember]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Get Microsoft Teams Data')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendAppBasedLinkQueryResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Response')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessageToTeamsChannel]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Response')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionActionResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionAttachmentsResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionAuthResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionBotMessagePreviewResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionConfigQuerySettingUrlResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionMessageResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionSelectItemResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Messaging Extension')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleCardResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Task module')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleMessageResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Task module')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleUrlResponse]: {
    menu: {
      submenu: [formatMessage('Microsoft Teams'), formatMessage('Task module')],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
} as UISchema;
