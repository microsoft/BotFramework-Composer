// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';

import DLServerContext from '../../dlServerState';
import { BotEndpoint } from '../botEndpoint';
import { Conversation } from '../conversation';

const mockPostResponse = jest.fn();

jest.mock('axios', () => ({
  post: (...args) => mockPostResponse(...args),
}));

const mockTranscript = [
  {
    type: 'activity add',
    activity: {
      type: 'conversationUpdate',
      membersAdded: [
        {
          id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
          name: 'User',
        },
        {
          id: '1',
          name: 'Bot',
        },
      ],
      channelId: 'emulator',
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      id: 'b9c48e00-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:30-08:00',
      recipient: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      timestamp: '2019-01-23T20:30:30.111Z',
      from: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        name: 'User',
      },
      locale: 'en-us',
      serviceUrl: 'https://3a469f6b.ngrok.io',
    },
  },
  {
    type: 'activity add',
    activity: {
      type: 'message',
      serviceUrl: 'https://3a469f6b.ngrok.io',
      channelId: 'emulator',
      from: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      recipient: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        role: 'user',
      },
      text: '[conversationUpdate event detected]',
      inputHint: 'acceptingInput',
      replyToId: 'b9c48e00-1f4d-11e9-bad7-9740f2a4e769',
      id: 'bce46ba0-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:35-08:00',
      timestamp: '2019-01-23T20:30:35.354Z',
      locale: 'en-us',
    },
  },
  {
    type: 'activity add',
    activity: {
      type: 'message',
      serviceUrl: 'https://3a469f6b.ngrok.io',
      channelId: 'emulator',
      from: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      recipient: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        role: 'user',
      },
      text: '[conversationUpdate event detected]',
      inputHint: 'acceptingInput',
      replyToId: 'b9c50330-1f4d-11e9-bad7-9740f2a4e769',
      id: 'bde42860-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:37-08:00',
      timestamp: '2019-01-23T20:30:37.030Z',
      locale: 'en-us',
    },
  },
];

const mockActivity = {
  type: 'conversationUpdate',
  membersAdded: [
    {
      id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
      name: 'User',
    },
    {
      id: '1',
      name: 'Bot',
    },
  ],
} as Activity;

jest.mock('moment', () => () => ({
  format: () => '2020-02-24T14:55:52-08:00',
  toISOString: () => '2020-02-24T14:55:52-08:00',
}));

const mockUserActivity: Activity = {
  type: 'message',
  serviceUrl: 'https://70d0a286.ngrok.io',
  channelId: 'emulator',
  from: {
    id: '1',
    name: 'Bot',
    role: 'bot',
  },
  conversation: {
    id: '95d86570-1f5c-11e9-b075-774f2d8ccec5|livechat',
    isGroup: false,
    conversationType: '',
    tenantId: '',
    name: '',
  },
  recipient: {
    id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
    name: 'User',
  },
  text: '[conversationUpdate event detected]',
  inputHint: 'acceptingInput',
  replyToId: '96547340-1f5c-11e9-9b39-f387f690c8a4',
  id: 'test',
} as Activity;

describe('Conversation class', () => {
  let botEndpointBotId;
  let botEndpoint;
  let conversation: Conversation;
  let conversationId;
  let user: any;

  beforeEach(() => {
    botEndpointBotId = 'someBotEndpointBotId';
    botEndpoint = new BotEndpoint('123', botEndpointBotId, 'http://localhost:3978/api/messages');

    conversationId = 'someConversationId';
    user = { id: 'someUserId' };
    conversation = new Conversation(botEndpoint, conversationId, user, 'livechat');
  });

  it('should get the transcript from the conversation', async () => {
    (conversation as any).transcript = mockTranscript;
    const transcripts = await conversation.getTranscript();
    expect(transcripts.length).toBe(3);
    let i = transcripts.length;
    while (i--) {
      expect(transcripts[i]).toEqual(mockTranscript[i].activity);
    }
  });

  it('should post an activity to the bot', async () => {
    const formattedDataStr = '2020-02-24T14:55:52-08:00';
    const isoDateStr = '2020-02-24T14:55:52-08:00';
    const serverState = DLServerContext.getInstance(3000);
    mockPostResponse.mockResolvedValueOnce({
      data: {
        status: 201,
      },
    });
    const result = await conversation.postActivityToBot(serverState.state, mockActivity);

    const postedActivity: Activity | undefined = result.sendActivity;
    expect(postedActivity?.localTimestamp).toBe(formattedDataStr);
    expect(postedActivity?.timestamp).toBe(isoDateStr);
  });

  it('should receive activities from the bot', async () => {
    conversation.prepActivityToBeSentToUser('user-1', mockUserActivity);
    const transcripts = await conversation.getTranscript();
    const matchedActivity = transcripts.find(
      (activity) => activity.conversation.id === mockUserActivity.conversation.id
    );
    expect(matchedActivity).toBeDefined();
  });
});
