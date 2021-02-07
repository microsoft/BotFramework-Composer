// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

export default {
  [SDKKinds.GetMeetingParticipant]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetMember]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetPagedMembers]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetPagedTeamMembers]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetTeamChannels]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetTeamDetails]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.GetTeamMember]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendAppBasedLinkQueryResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessageToTeamsChannel]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionActionResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionAttachmentsResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionAuthResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionBotMessagePreviewResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionConfigQuerySettingUrlResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionMessageResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendMessagingExtensionSelectItemResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendTaskModuleCardResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendTaskModuleMessageResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
  [SDKKinds.SendTaskModuleUrlResponse]: {
    menu: {
      submenu: ['Teams'],
    },
    flow: {
      widget: 'ActionCard',
    },
  },
} as UISchema;
