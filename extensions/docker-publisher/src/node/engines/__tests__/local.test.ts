// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfigSettings, ExecResult } from '../../../types';
import { execAsync } from '../../../utils/fs';
import { DockerContext } from '../../../types/dockerTypes';
import { IEngine } from '../IEngine';
import { LocalDocker } from '../Local';

jest.mock('../../../utils/fs', () => ({
  execAsync: jest.fn(),
}));

describe('Test ACR Docker Engine', () => {
  let settings: ConfigSettings;
  let context: DockerContext;
  let instance: IEngine;
  beforeAll(() => {
    instance = new LocalDocker();
    settings = {
      url: 'myACR.azurecr.io',
      image: 'myImage',
      tag: 'myTag',
      creationType: '',
      username: '',
      password: '',
      botId: '',
      botName: '',
      botPath: '',
    };
    context = {
      imageName: 'myimage',
      botName: 'myBot',
      dockerfile: 'myDockerfile',
      botPath: 'myBotPath',
      username: '',
      password: '',
      logger: (step, message, status) => {},
    };
  });

  describe('Test Mount Image Name', () => {
    it("Create image name as 'myImage:myTag'", () => {
      expect(instance.mountImageName(settings)).toEqual('myImage:myTag');
    });
  });

  describe('Test Push Image', () => {
    it('Returns not needed message', async () => {
      const { stdout, stderr } = await instance.push(context);
      expect(stdout).toEqual('Not required for Local images');
      expect(stderr).toBeUndefined();
    });
  });

  describe('Test Verify Image', () => {
    it('Image is created', async () => {
      (execAsync as jest.Mock).mockImplementation(
        async (command: string): Promise<ExecResult> => {
          return Promise.resolve({ stdout: 'Image digest Id', stderr: undefined });
        }
      );

      const success = await instance.verify(context);
      expect(success).toBeTruthy();
    });

    it('Image is NOT created', async () => {
      (execAsync as jest.Mock).mockImplementation(
        async (command: string): Promise<ExecResult> => {
          return Promise.resolve({ stdout: undefined, stderr: 'Erro message' });
        }
      );

      const success = await instance.verify(context);
      expect(success).toBeFalsy();
    });
  });
});
