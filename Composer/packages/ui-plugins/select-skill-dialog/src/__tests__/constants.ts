// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Skill } from '@bfc/extension-client';

export const skills: Record<string, Skill> = {
  yuesuemailskill0207: {
    id: '123-abc',
    remote: false,
    description: 'Production endpoint for the Email Skill',
    name: 'yuesuemailskill0207',
    manifest: {
      version: '1.0',
      name: 'yuesuemail-2.0.1-manifest',
      description: 'Production endpoint for the Email Skill',
      endpoints: [
        {
          name: 'production',
          protocol: 'BotFrameworkV3',
          description: 'Production endpoint for the Email Skill',
          endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
          msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
        },
      ],
    },
  },
  sandwichskill: {
    id: '234-abc',
    remote: false,
    description: 'Production endpoint for the Email Skill',
    name: 'sandwichskill0207',
    manifest: {
      version: '1.0',
      name: 'sandwich-manifest',
      description: 'Production endpoint for the Email Skill',
      endpoints: [
        {
          name: 'YourSandwichBotName',
          protocol: 'BotFrameworkV3',
          description: 'Default endpoint for the skill',
          endpointUrl: 'https://ericv3skillssimplesandwichbot.azurewebsites.net/api/messages',
          msAppId: '94e29d0f-3f0d-46f0-aa78-00aed83698cf',
        },
        {
          name: 'YourSandwichBotName2',
          protocol: 'BotFrameworkV3',
          description: 'Backup endpoint for the skill',
          endpointUrl: 'https://ericv3skills2simplesandwichbot.azurewebsites.net/api/messages',
          msAppId: '94e29d0f-3f0d-46f0-aa78-00aed83698cfd',
        },
      ],
    },
  },
};
