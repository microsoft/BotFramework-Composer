// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import rimraf from 'rimraf';

import { Path } from '../../utility/path';
import { BotProjectService } from '../project';

// offer a bot project ref which to open
jest.mock('../../store/store', () => {
  const data = {
    storageConnections: [
      {
        id: 'default',
        name: 'This PC',
        type: 'LocalDisk',
        path: '.',
        defaultPath: '.',
      },
    ],
    recentBotProjects: [] as any[],
    projectLocationMap: {},
  } as any;
  return {
    Store: {
      get: (key: string) => {
        return data[key];
      },
      set: (key: string, value: any) => {
        // console.log(`set ${value} in store`);
      },
    },
  };
});

jest.mock('azure-storage', () => {});

const projPath = Path.resolve(__dirname, '../../__mocks__/samplebots/bot1');

const saveAsDir = Path.resolve(__dirname, '../../__mocks__/samplebots/saveas');

const location1 = {
  storageId: 'default',
  path: projPath,
};

const location2 = {
  storageId: 'default',
  path: saveAsDir,
};

afterAll(() => {
  // remove the saveas files
  try {
    rimraf.sync(saveAsDir);
  } catch (error) {
    throw new Error(error);
  }
});

describe('test BotProjectService', () => {
  it('openProject', async () => {
    const projectId = await BotProjectService.openProject(location1);
    const otherId = '12345.678';
    await expect(BotProjectService.getProjectById(otherId)).rejects.toThrowError(
      `project ${otherId} not found in cache`
    );
    expect((await BotProjectService.getProjectById(projectId)).dir).toBe(projPath);
  });

  it('saveProjectAs', async () => {
    const currentProjectId = await BotProjectService.openProject(location1);
    const currentProject = await BotProjectService.getProjectById(currentProjectId);
    const targetProjectId = await BotProjectService.saveProjectAs(currentProject, location2);
    expect((await BotProjectService.getProjectById(targetProjectId)).dir).toBe(saveAsDir);
  });
});
