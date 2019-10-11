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
