// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerUtils } from './composerUtils';
import { sleep } from './uitils';

jest.setTimeout(1000 * 60 * 10);
const directlineToken = process.env.DAILY_CI_DIRECTLINE_TOKEN;

describe('test sample bot', () => {
  it('could publish luis bot', () => {
    const botName = ''; // TODO
    const botId = ''; // TODO
    const composerUtils = new ComposerUtils(botId, botName);
    expect(composerUtils.publishBot()).resolves.toBeTruthy();
    sleep(10000);
  });
});
