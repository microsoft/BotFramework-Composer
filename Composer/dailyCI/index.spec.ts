// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTokenManager } from './azureTokenManager';
import { ComposerApi } from './composerApi';
import { DirectLineTester } from './directLineTester';

jest.setTimeout(1000 * 60 * 10);
const directlineToken = process.env.DAILY_CI_DIRECTLINE_TOKEN;

const publishTargets = {
  todoLuisBot: {
    botName: 'ToDoBotWithLuisSample-37',
    botId: '55586.955975498255',
  },
  qnaBot: {
    botName: 'QnASample-0',
    botId: '97560.9290918719',
  },
  echoBot: {
    botName: 'EchoBot-0',
    botId: '63678.489045529794',
  },
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('luis todo bot', async () => {
  test('could publish luis bot', async () => {
    const botName = publishTargets.todoLuisBot.botName;
    const botId = publishTargets.todoLuisBot.botId;
    const publishResult = await PublishBot(botName, botId);
    expect(publishResult).toBeTruthy();
    await sleep(10000);
  });

  test('add todo flow1', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('add');
    expect(result1[0]).toBe('What would you like to add?');
    const result2 = await tester.SendAndGetMessages('abcabc');
    expect(result2[0]).toBe('Pick a list to add the item to..');
    const result3 = await tester.SendAndGetMessages('todo');
    expect(result3[0]).toBe("Sure. I've added **abcabc** to **todo** list. You have 1 items in your list.");
  });

  test('add todo flow2', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('add');
    expect(result1[0]).toBe('What would you like to add?');
    const result2 = await tester.SendAndGetMessages('abcdefg');
    expect(result2[0]).toBe('Pick a list to add the item to..');
    const result3 = await tester.SendAndGetMessages('todo');
    expect(result3[0]).toBe("Sure. I've added **abcdefg** to **todo** list. You have 1 items in your list.");
  });
});

describe('echo bot', async () => {
  test('could publish echo bot', async () => {
    const botName = publishTargets.echoBot.botName;
    const botId = publishTargets.echoBot.botId;
    const publishResult = await PublishBot(botName, botId);
    expect(publishResult).toBeTruthy();
    await sleep(10000);
  });

  test('echo back "hello"', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('hello');
    expect(result1[0]).toBe("You said 'hello'");
  });

  test('echo back "test"', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('test');
    expect(result1[0]).toBe("You said 'test'");
  });
});

describe('qna bot', async () => {
  test('could publish qna bot', async () => {
    const botName = publishTargets.qnaBot.botName;
    const botId = publishTargets.qnaBot.botId;
    const publishResult = await PublishBot(botName, botId);
    expect(publishResult).toBeTruthy();
    await sleep(10000);
  });

  test('qna test question', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('test question');
    expect(result1[0]).toBe('test response');
  });

  test('qna test question 2', async () => {
    const tester = new DirectLineTester(directlineToken);
    const result1 = await tester.SendAndGetMessages('test qna');
    expect(result1[0]).toBe('test qna answer');
  });
});

async function PublishBot(botName: string, botId: string) {
  const composerAPI = new ComposerApi();
  const azureTokenManager = new AzureTokenManager();
  const tokenResponse = await azureTokenManager.GetAccessToken();
  const jsonResult = JSON.parse(tokenResponse);
  const token = jsonResult.accessToken;
  const targetName = 'testPublish';
  const updateSettingsResult = await composerAPI.SetAppSettings(token, botId, botName, targetName);
  console.log(`update result: ${updateSettingsResult}`);

  if (!updateSettingsResult) {
    return false;
  }
  const startPublishResult = await composerAPI.StartPublish(token, botId, botName, targetName);
  console.log(`start publish result: ${startPublishResult}`);
  if (!startPublishResult) {
    return undefined;
  }

  let message = undefined;
  while (message !== 'Success') {
    const statusResult = await composerAPI.GetPublishStatus(botId, targetName);
    console.log(statusResult);
    if (!statusResult) {
      return false;
    }
    message = statusResult;
    await sleep(5000);
  }
  return true;
}
