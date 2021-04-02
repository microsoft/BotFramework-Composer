// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const sendActivityStub = {
  $kind: 'Microsoft.SendActivity',
  $designer: {
    id: 'AwT1u7',
  },
};

export const switchConditionStub = {
  $kind: 'Microsoft.SwitchCondition',
  $designer: {
    id: 'sJzdQm',
  },
  default: [sendActivityStub],
  cases: [
    {
      value: 'case1',
      actions: [sendActivityStub],
    },
  ],
};

export const onConversationUpdateActivityStub = {
  $kind: 'Microsoft.OnConversationUpdateActivity',
  $designer: {
    id: '376720',
  },
  actions: [switchConditionStub],
};

export const simpleGreetingDialog: any = {
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
  triggers: [onConversationUpdateActivityStub],
  $schema:
    'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema',
  generator: 'EmptyBot-1.lg',
  id: 'EmptyBot-1',
  recognizer: 'EmptyBot-1.lu.qna',
};
