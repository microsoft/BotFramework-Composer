// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

const Groups = {
  Teams: 'Teams',
  GetData: 'Get Teams data',
  MessagingExtension: 'Messaging Extension',
  TaskModule: 'Task module',
  Response: 'Response',
};

export default {
  [SDKKinds.GetMeetingParticipant]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetMember]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetPagedMembers]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetPagedTeamMembers]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamChannels]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamDetails]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.GetTeamMember]: {
    menu: {
      submenu: [Groups.Teams, Groups.GetData],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendAppBasedLinkQueryResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.Response],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessageToTeamsChannel]: {
    menu: {
      submenu: [Groups.Teams, Groups.Response],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionActionResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionAttachmentsResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionAuthResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionBotMessagePreviewResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionConfigQuerySettingUrlResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionMessageResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendMessagingExtensionSelectItemResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.MessagingExtension],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleCardResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.TaskModule],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleMessageResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.TaskModule],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
  [SDKKinds.SendTaskModuleUrlResponse]: {
    menu: {
      submenu: [Groups.Teams, Groups.TaskModule],
    },
    flow: {
      widget: 'ActionHeader',
    },
  },
} as UISchema;
