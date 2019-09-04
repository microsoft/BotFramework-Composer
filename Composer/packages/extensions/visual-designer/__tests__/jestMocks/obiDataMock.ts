export const mockData = {
  $type: 'Microsoft.AdaptiveDialog',
  $designer: {
    createdAt: '2019-07-03T06:51:37.526Z',
    updatedAt: '2019-07-16T20:00:39.131Z',
    id: '808722',
  },
  autoEndDialog: true,
  $schema: '../../app.schema',
  rules: [
    {
      $type: 'Microsoft.EventRule',
      $designer: {
        id: '335456',
        updatedAt: '2019-07-22T08:10:44.402Z',
      },
      events: ['beginDialog'],
      steps: [
        {
          $type: 'Microsoft.SetProperty',
          $designer: {
            createdAt: '2019-07-16T20:00:51.769Z',
            updatedAt: '2019-08-02T22:30:32.704Z',
            id: '201694',
          },
          property: 'dialog.todo',
          value: '@title',
        },
        {
          $type: 'Microsoft.TextInput',
          $designer: {
            createdAt: '2019-07-16T20:00:55.825Z',
            updatedAt: '2019-07-16T20:00:59.346Z',
            id: '298897',
          },
          property: 'dialog.todo',
          prompt: 'OK, please enter the title of your todo.',
          maxTurnCount: 0,
          alwaysPrompt: false,
          allowInterruptions: 'never',
          outputFormat: 'none',
        },
        {
          $type: 'Microsoft.IfCondition',
          $designer: {
            createdAt: '2019-07-16T20:01:05.970Z',
            updatedAt: '2019-07-16T20:01:13.866Z',
            id: '015420',
          },
          condition: 'user.todos == null',
          steps: [
            {
              $type: 'Microsoft.InitProperty',
              $designer: {
                createdAt: '2019-07-16T20:01:05.970Z',
                updatedAt: '2019-07-16T20:01:13.866Z',
                id: '015420',
              },
              property: 'user.todos',
              type: 'array',
            },
          ],
          elseSteps: [
            {
              $type: 'Microsoft.TextInput',
              $designer: {
                name: 'Prompt for text',
                id: '620430',
                updatedAt: '2019-09-04T09:30:26.615Z',
              },
              outputFormat: 'none',
              allowInterruptions: 'never',
              maxTurnCount: 2147483647,
              alwaysPrompt: false,
            },
          ],
        },
        {
          $type: 'Microsoft.EditArray',
          $designer: {
            createdAt: '2019-07-01T22:02:54.672Z',
            updatedAt: '2019-08-02T22:32:37.062Z',
            id: '567087',
          },
          changeType: 'Push',
          arrayProperty: 'user.todos',
          value: 'dialog.todo',
        },
        {
          $type: 'Microsoft.SendActivity',
          $designer: {
            createdAt: '2019-07-01T22:02:53.545Z',
            updatedAt: '2019-07-16T20:01:26.980Z',
            id: '116673',
          },
          activity: '[bfdactivity-116673]',
        },
      ],
    },
  ],
};
