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

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockReturnValue(true),
  existsSync: jest.fn().mockReturnValue(true),
  remove: jest.fn().mockResolvedValue(undefined),
}));

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

  describe('backing up a project', () => {
    const envBackup = { ...process.env };
    const mockProject: any = {
      cloneFiles: jest.fn().mockResolvedValue(undefined),
      dir: '/bot/dir',
      id: 'botId',
    };

    beforeAll(() => {
      process.env.COMPOSER_BACKUP_DIR = '/path/to/backup';
    });

    afterAll(() => {
      Object.assign(process.env, envBackup);
    });

    it('should backup a project', async () => {
      const backupPath = await BotProjectService.backupProject(mockProject);

      expect(backupPath.startsWith(Path.join(process.env.COMPOSER_BACKUP_DIR as string), mockProject));
    });

    it('should throw an error if something goes wrong', async () => {
      const error = new Error('There was a project cloning the files.');
      mockProject.cloneFiles.mockRejectedValueOnce(error);
      expect(async () => await BotProjectService.backupProject(mockProject)).rejects.toThrowError(
        new Error(`Failed to backup project ${mockProject.id}: ${error}`)
      );
    });
  });
});
