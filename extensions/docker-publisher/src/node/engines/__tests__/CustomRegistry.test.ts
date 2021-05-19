// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfigSettings, ExecResult } from '../../../types';
import { DockerContext } from '../../../types/dockerTypes';
import { execAsync } from '../../../utils/fs';

import { IEngine } from '../IEngine';
import { CustomRegistry } from '../CustomRegistry';

jest.mock('../../../utils/fs', () => ({
  execAsync: jest.fn(),
}));

describe('Test Custom Docker Engine', () => {
  let settings: ConfigSettings;
  let context: DockerContext;
  let instance: IEngine;
  beforeAll(() => {
    instance = new CustomRegistry();
    settings = {
      url: 'myregistry:5000',
      image: 'myImage',
      tag: 'myTag',
      creationType: '',
      username: 'username',
      password: 'P@ssw0rd',
      botId: '',
      botName: '',
      botPath: '',
    };
    context = {
      imageName: 'myregistry:5000/myimage:myTag',
      botName: 'myBot',
      dockerfile: 'myDockerfile',
      botPath: 'myBotPath',
      username: '',
      password: '',
      logger: (step, message, status) => {},
    };
  });

  describe('Test Mount Image Name', () => {
    it("Create image name as 'myregistry:5000/myImage:myTag'", () => {
      expect(instance.mountImageName(settings)).toEqual('myregistry:5000/myImage:myTag');
    });
  });

  describe('Test Push Image', () => {
    it('Pushed with success', async () => {
      (execAsync as jest.Mock).mockImplementation(
        async (command: string): Promise<ExecResult> => {
          return Promise.resolve({ stdout: 'Push logs', stderr: undefined });
        }
      );

      const { stdout, stderr } = await instance.push(context);
      expect(stdout).not.toBeUndefined();
      expect(stderr).toBeUndefined();
    });

    describe('Push with error', () => {
      it('Failed push', async () => {
        (execAsync as jest.Mock).mockImplementation(
          async (command: string): Promise<ExecResult> => {
            return Promise.resolve({ stdout: 'Push logs', stderr: 'Failed to push' });
          }
        );

        const { stdout, stderr } = await instance.push(context);
        expect(stderr).not.toBeUndefined();
      });
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
