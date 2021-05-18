// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fetch } from 'node-fetch';

import { ConfigSettings, ExecResult } from '../../types';
import { DockerContext } from '../../types/dockerTypes';
import { execAsync } from '../../utils/fs';

import { IEngine } from './IEngine';
import { DockerHub } from './DockerHub';

jest.mock('../../utils/fs', () => ({
  execAsync: jest.fn(),
}));

jest.mock('node-fetch', () => ({
  fetch: jest.fn(),
}));

describe('Test ACR Docker Engine', () => {
  let settings: ConfigSettings;
  let context: DockerContext;
  let instance: IEngine;
  beforeAll(() => {
    instance = new DockerHub();
    settings = {
      url: '',
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
      imageName: 'username/myimage:myTag',
      botName: 'myBot',
      dockerfile: 'myDockerfile',
      botPath: 'myBotPath',
      username: '',
      password: '',
      logger: (step, message, status) => {},
    };

    window.fetch = fetch;
  });

  describe('Test Mount Image Name', () => {
    it("Create image name as 'myACR.azurecr.io/myImage:myTag'", () => {
      expect(instance.mountImageName(settings)).toEqual('username/myImage:myTag');
    });
  });

  describe('Test Push Image', () => {
    it('Pushed with success', async () => {
      execAsync.mockImplementation(
        async (command: string): Promise<ExecResult> => {
          if (command.indexOf('login') > 0) {
            return Promise.resolve({ stdout: 'LOGIN WITH SUCCESS', stderr: undefined });
          } else {
            return Promise.resolve({ stdout: 'Push logs', stderr: undefined });
          }
        }
      );

      const { stdout, stderr } = await instance.push(context);
      expect(stdout).not.toBeUndefined();
      expect(stderr).toBeUndefined();
    });

    describe('Push with error', () => {
      it('Failed login', async () => {
        execAsync.mockImplementation(
          async (command: string): Promise<ExecResult> => {
            if (command.indexOf('login') > 0) {
              return Promise.resolve({ stdout: undefined, stderr: 'INVALID USER' });
            } else {
              return Promise.resolve({ stdout: 'Push logs', stderr: undefined });
            }
          }
        );

        const { stdout, stderr } = await instance.push(context);
        expect(stdout).toBeUndefined();
        expect(stderr).toEqual('Failed login');
      });

      it('Failed push', async () => {
        execAsync.mockImplementation(
          async (command: string): Promise<ExecResult> => {
            if (command.indexOf('login') > 0) {
              return Promise.resolve({ stdout: 'SUCCESS', stderr: undefined });
            } else {
              return Promise.resolve({ stdout: 'Push logs', stderr: 'Failed to push' });
            }
          }
        );

        const { stdout, stderr } = await instance.push(context);
        expect(stderr).not.toBeUndefined();
      });
    });
  });

  describe('Test Verify Image', () => {
    it('Image is created', async () => {
      fetch.mockImplementation(
        (Request: string): Promise<any> => {
          if (Request.indexOf('/login') > 0) {
            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({
                  token: 'VALID BEARER TOKEN',
                });
              },
            });
          } else {
            expect(Request).toEqual('https://hub.docker.com/v2/repositories/username/myimage/tags');

            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({
                  results: [{ name: 'myTag' }],
                });
              },
            });
          }
        }
      );

      const success = await instance.verify(context);
      expect(success).toBeTruthy();
    });

    describe('Image is NOT created', () => {
      it('Login failed', async () => {
        fetch.mockImplementation(
          (Request: string): Promise<any> => {
            if (Request.indexOf('/login') > 0) {
              return Promise.resolve({
                status: 400,
                ok: false,
                text() {
                  return Promise.resolve('LOGIN FAILED');
                },
                json() {
                  return Promise.resolve({
                    token: 'VALID BEARER TOKEN',
                  });
                },
              });
            } else {
              expect(Request).toEqual('https://hub.docker.com/v2/repositories/username/myimage/tags');

              return Promise.resolve({
                status: 200,
                ok: true,
                json() {
                  return Promise.resolve({
                    results: [{ name: 'myTag' }],
                  });
                },
              });
            }
          }
        );

        const success = await instance.verify(context);
        expect(success).toBeFalsy();
      });

      it('Image not found tags', async () => {
        fetch.mockImplementation(
          (Request: string): Promise<any> => {
            if (Request.indexOf('/login') > 0) {
              return Promise.resolve({
                status: 200,
                ok: true,
                json() {
                  return Promise.resolve({
                    token: 'VALID BEARER TOKEN',
                  });
                },
              });
            } else {
              expect(Request).toEqual('https://hub.docker.com/v2/repositories/username/myimage/tags');

              return Promise.resolve({
                status: 404,
                ok: false,
                text() {
                  return Promise.resolve('IMAGE NOT FOUND');
                },
                json() {
                  return Promise.resolve({
                    results: [{ name: 'myTag' }],
                  });
                },
              });
            }
          }
        );

        const success = await instance.verify(context);
        expect(success).toBeFalsy();
      });

      it('Error image tags not returned', async () => {
        fetch.mockImplementation(
          (Request: string): Promise<any> => {
            if (Request.indexOf('/login') > 0) {
              return Promise.resolve({
                status: 200,
                ok: true,
                json() {
                  return Promise.resolve({
                    token: 'VALID BEARER TOKEN',
                  });
                },
              });
            } else {
              expect(Request).toEqual('https://hub.docker.com/v2/repositories/username/myimage/tags');

              return Promise.resolve({
                status: 404,
                ok: false,
                text() {
                  return Promise.resolve('IMAGE NOT FOUND');
                },
                json() {
                  return Promise.resolve({
                    results: [{ name: 'latest' }],
                  });
                },
              });
            }
          }
        );

        const success = await instance.verify(context);
        expect(success).toBeFalsy();
      });
    });
  });
});
