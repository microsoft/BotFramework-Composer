// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const skills = [
  {
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Email Skill',
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
  {
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
  },
];

export const schema = {
  'Microsoft.SkillDialog': {
    $role: 'implements(Microsoft.IDialog)',
    title: 'Begin a skill dialog',
    description: 'Begin a remote skill dialog.',
    type: 'object',
    properties: {
      $kind: {
        title: '$kind',
        description: 'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
        type: 'string',
        pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        const: 'Microsoft.SkillDialog',
      },
      id: {
        type: 'string',
        title: 'Id',
        description: 'Optional id for the skill dialog',
      },
      skillAppId: {
        $role: 'expression',
        type: 'string',
        title: 'Skill App ID',
        description: 'The Microsoft App ID for the skill.',
      },
      skillEndpoint: {
        type: 'string',
        title: 'Skill endpoint ',
        description: 'The /api/messages endpoint for the skill.',
        examples: ['https://myskill.contoso.com/api/messages/'],
      },
    },
  },
};
