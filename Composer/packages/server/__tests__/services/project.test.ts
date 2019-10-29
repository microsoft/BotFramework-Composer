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
import rimraf from 'rimraf';

import { Path } from '../../src/utility/path';
import { BotProject } from '../../src/models/bot/botProject';
import { BotProjectService } from '../../src/services/project';

// offer a bot project ref which to open
jest.mock('../../src/store/store', () => {
  const data = {
    storageConnections: [
      {
        id: 'default',
        name: 'This PC',
        type: 'LocalDisk',
        path: '.',
      },
    ],
    recentBotProjects: [] as any[],
  } as any;
  return {
    Store: {
      get: (key: string) => {
        return data[key];
      },
      set: (key: string, value: any) => {
        console.log(`set ${value} in store`);
      },
    },
  };
});

jest.mock('azure-storage', () => {});

const projPath = Path.resolve(__dirname, '../mocks/samplebots/bot1');

const saveAsDir = Path.resolve(__dirname, '../mocks/samplebots/saveas');

describe('test BotProjectService', () => {
  it('openProject', async () => {
    expect(BotProjectService.getCurrentBotProject()).toBeUndefined();

    const botProj = {
      storageId: 'default',
      path: projPath,
    };
    await BotProjectService.openProject(botProj);
    expect(BotProjectService.getCurrentBotProject()).toBeDefined();
    expect((BotProjectService.getCurrentBotProject() as BotProject).dir).toBe(projPath);
  });
  it('saveProjectAs', async () => {
    const botProj = {
      storageId: 'default',
      path: saveAsDir,
    };
    await BotProjectService.saveProjectAs(botProj);
    expect((BotProjectService.getCurrentBotProject() as BotProject).dir).toBe(`${saveAsDir}`);
    // remove the saveas files
    try {
      rimraf.sync(saveAsDir);
    } catch (error) {
      throw new Error(error);
    }
  });
});
