/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { FileUpdateType } from '../../../src/models/bot/interface';
import { Path } from '../../../src/utility/path';

import { LuPublisher } from './../../../src/models/bot/luPublisher';
import service from './../../../src/services/storage';

const botDir = Path.join(__dirname, '../../mocks/samplebots/bot1');
const storage = service.getStorageClient('default');

describe('luis status management', () => {
  it('will get luis status', async () => {
    const luPublisher = new LuPublisher(botDir, storage);
    const status = await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu', 'bot1/Main.lu']);
    expect(status['bot1/a.lu'].lastUpdateTime).toBe(1);
    expect(status['bot1/a.lu'].lastPublishTime).toBe(0);
  });

  it('can update luis status', async () => {
    const luPublisher = new LuPublisher(botDir, storage);

    await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu', 'bot1/Main.lu']);
    const oldUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;

    await luPublisher.onFileChange('bot1/a.lu', FileUpdateType.UPDATE);
    const newUpdateTime = luPublisher.status['bot1/a.lu'].lastUpdateTime;
    // update should increase the update time
    expect(newUpdateTime).toBeGreaterThan(oldUpdateTime);
  });
});

describe('get unpublishedFiles', () => {
  it('will get unpublished files', async () => {
    const lufiles = [
      {
        diagnostics: [],
        id: 'a',
        relativePath: 'bot1/a.lu',
        content: '',
        parsedContent: {
          LUISJsonStructure: {
            intents: [],
            utterances: [],
          },
        },
      },
      {
        diagnostics: [],
        id: 'b',
        relativePath: 'bot1/b.lu',
        content: '',
        parsedContent: {
          LUISJsonStructure: {
            intents: [],
            utterances: [],
          },
        },
      },
    ];

    const luPublisher = new LuPublisher(botDir, storage);
    await luPublisher.loadStatus(['bot1/a.lu', 'bot1/b.lu']); // relative path is key

    let files = luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(2);
    const curTime = Date.now();
    luPublisher.status['bot1/a.lu'].lastPublishTime = curTime; // assumming we publish a.lu
    luPublisher.status['bot1/b.lu'].lastPublishTime = curTime; // and b.lu
    files = luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(0);

    await luPublisher.onFileChange('bot1/a.lu', FileUpdateType.UPDATE);
    files = luPublisher.getUnpublisedFiles(lufiles);
    expect(files.length).toBe(1);
  });
});
