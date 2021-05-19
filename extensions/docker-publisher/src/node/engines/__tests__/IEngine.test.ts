// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { pathExistsSync } from 'fs-extra';

import { ConfigSettings, ExecResult } from '../../../types';
import { DockerContext } from '../../../types/dockerTypes';
import { execAsync } from '../../../utils/fs';
import { IEngine } from '../IEngine';

class DummyEngine extends IEngine {
  mountImageName(settings: ConfigSettings): string {
    throw new Error('Method not implemented.');
  }
  verify(context: DockerContext): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  push(context: DockerContext): Promise<ExecResult> {
    throw new Error('Method not implemented.');
  }
}

jest.mock('../../../utils/fs', () => ({
  execAsync: jest.fn(),
}));

describe('Test IEngine Abstract class implemented Methods', () => {
  let context: DockerContext;
  let instance: IEngine;
  beforeAll(() => {
    instance = new DummyEngine();
    context = {
      imageName: 'myimage',
      botName: 'myBot',
      dockerfile: 'myDockerfile',
      botPath: 'myBotPath',
      username: '',
      password: '',
    };
  });

  describe('Test BuildImage', () => {
    it('When success', async () => {
      (execAsync as jest.Mock).mockImplementation(
        async (command: string): Promise<ExecResult> => {
          return Promise.resolve({ stdout: 'true', stderr: undefined });
        }
      );

      const { stdout, stderr } = await instance.buildImage(context);
      expect(stdout).not.toBeUndefined();
      expect(stderr).toBeUndefined();
    });

    it('When not success', async () => {
      (execAsync as jest.Mock).mockImplementation(
        async (command: string): Promise<ExecResult> => {
          return Promise.resolve({ stdout: undefined, stderr: 'true' });
        }
      );

      const { stdout, stderr } = await instance.buildImage(context);
      expect(stdout).toBeUndefined();
      expect(stderr).not.toBeUndefined();
    });
  });
});
