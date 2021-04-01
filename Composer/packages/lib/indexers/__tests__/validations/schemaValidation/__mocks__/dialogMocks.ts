// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const simpleGreeting: any = {
  $kind: 'Microsoft.AdaptiveDialog',
  $designer: {
    $designer: {
      name: 'EmptyBot-1',
      description: '',
      id: '47yxe0',
    },
  },
  autoEndDialog: true,
  defaultResultProperty: 'dialog.result',
  triggers: [
    {
      $kind: 'Microsoft.OnConversationUpdateActivity',
      $designer: {
        id: '376720',
      },
      actions: [
        {
          $kind: 'Microsoft.SwitchCondition',
          $designer: {
            id: 'sJzdQm',
          },
          cases: [
            {
              value: 'asd',
              actions: [
                {
                  $kind: 'Microsoft.SendActivity',
                  $designer: {
                    id: 'AwT1u7',
                  },
                },
              ],
            },
          ],
          default: [
            {
              $kind: 'Microsoft.SendActivity',
              $designer: {
                id: 'rMLkPc',
              },
            },
          ],
        },
      ],
    },
  ],
  $schema:
    'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema',
  generator: 'EmptyBot-1.lg',
  id: 'EmptyBot-1',
  recognizer: 'EmptyBot-1.lu.qna',
};
