// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const skills = [
  {
    id: 'yuesuemailskill0207',
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    endpoints: [
      {
        name: 'production',
        protocol: 'BotFrameworkV3',
        description: 'Production endpoint for the Email Skill',
        endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
        msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
      },
    ],
    name: 'Email Skill',
    description: 'Production endpoint for the Email Skill',
    content: {},
  },
  {
    id: 'sandwich',
    manifestUrl: 'https://ericv3skillssimplesandwichbot.azurewebsites.net/wwwroot/sandwich-bot-manifest.json',
    name: 'Sandwich Skill Bot',
    endpoints: [
      {
        name: 'YourSandwichBotName',
        protocol: 'BotFrameworkV3',
        description: 'Default endpoint for the skill',
        endpointUrl: 'https://ericv3skillssimplesandwichbot.azurewebsites.net/api/messages',
        msAppId: '94e29d0f-3f0d-46f0-aa78-00aed83698cf',
      },
    ],
    description: 'Default endpoint for the skill',
    content: {},
  },
];
