import { BotProject } from 'src/models/bot/botProject';
import rimraf from 'rimraf';

import { Path } from '../../src/utility/path';
import projectService from '../../src/services/project';
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
const projPath = Path.resolve(__dirname, '../mocks/1.botproj');
describe('test BotProjectService', () => {
  it('openProject', async () => {
    expect(projectService.currentBotProject).toBeUndefined();

    const botProj = {
      storageId: 'default',
      path: projPath,
    };
    await projectService.openProject(botProj);
    expect(projectService.currentBotProject).toBeDefined();
    expect((projectService.currentBotProject as BotProject).absolutePath).toBe(projPath);
  });
  it('saveProjectAs', async () => {
    const botProj = {
      storageId: 'default',
      path: Path.resolve(__dirname, '../mocks/saveas/1.botproj'),
    };
    await projectService.saveProjectAs(botProj);
    expect((projectService.currentBotProject as BotProject).absolutePath).toBe(
      Path.resolve(__dirname, '../mocks/saveas/1.botproj')
    );
    // remove the saveas files
    try {
      rimraf.sync(Path.resolve(__dirname, '../mocks/saveas'));
    } catch (error) {
      //ignore
    }
  });
});
