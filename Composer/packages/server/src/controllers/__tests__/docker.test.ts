// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { fetch } from 'node-fetch';

import { DockerEngineController } from '../docker';
import { execAsync } from '../../utility/process';

jest.mock('../../utility/process', () => ({
  execAsync: jest.fn(),
}));

jest.mock('node-fetch', () => ({
  fetch: jest.fn(),
}));

let res: Response = {} as Response;

beforeAll(() => {
  window.fetch = fetch;
});
beforeEach(() => {
  res = ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown) as Response;
});

describe('Check Docker Version', () => {
  it('Docker is running', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;

    (execAsync as jest.Mock).mockImplementation(async (command: string) => {
      if (command === 'docker version') {
        return Promise.resolve({ stderr: undefined });
      } else {
        return Promise.resolve({ stdout: 'My Docker Version' });
      }
    });

    await DockerEngineController.checkDockerVersion(mockReq, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userHasDocker: true,
      DockerVersion: 'My Docker Version',
    });
  });

  it('Docker is NOT running', async () => {
    const mockReq = {
      params: {},
      query: {},
      body: {},
    } as Request;

    (execAsync as jest.Mock).mockImplementation(async (command: string) => {
      if (command === 'docker version') {
        return Promise.resolve({ stderr: '...This error may indicate that the docker daemon is not running...' });
      } else {
        return Promise.resolve({ stdout: 'My Docker Version' });
      }
    });

    await DockerEngineController.checkDockerVersion(mockReq, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userHasDocker: false,
    });
  });
});

describe('Get Tags', () => {
  describe('Local Docker', () => {
    it('Existing image', async () => {
      const mockReq = {
        params: { from: 'local', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      (execAsync as jest.Mock).mockImplementation(async (command: string) => {
        return Promise.resolve({ stdout: 'latest\r\nv1\r\nv2' });
      });

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(['latest', 'v1', 'v2']);
    });

    it('Not found image', async () => {
      const mockReq = {
        params: { from: 'local', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      (execAsync as jest.Mock).mockImplementation(async (command: string) => {
        return Promise.resolve({ stdout: '' });
      });

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('Command not found', async () => {
      const mockReq = {
        params: { from: 'local', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      (execAsync as jest.Mock).mockImplementation(async (command: string) => {
        return Promise.resolve({ stderr: 'Command not found' });
      });

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ Error: 'Command not found' });
    });
  });

  describe('Azure Container Registry', () => {
    it('Existing image', async () => {
      const mockReq = {
        params: { from: 'acr', image: 'mybot' },
        query: {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Basic MYBASICTOKEN`,
          },
        },
        body: {},
      } as Request;

      (fetch as jest.Mock).mockImplementation(
        (Request: string): Promise<any> => {
          return Promise.resolve({
            status: 200,
            ok: true,
            json() {
              return Promise.resolve({
                tags: [{ name: 'latest' }, { name: 'v1' }, { name: 'v2' }],
              });
            },
          });
        }
      );

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(['latest', 'v1', 'v2']);
    });

    it('Not found image', async () => {
      const mockReq = {
        params: { from: 'acr', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      (fetch as jest.Mock).mockImplementation(
        (Request: string): Promise<any> => {
          return Promise.resolve({
            status: 404,
            ok: false,
            text() {
              return Promise.resolve(
                '{"errors":[{"code":"NAME_UNKNOWN","message":"repository "mybot" is not found"}]}'
              );
            },
          });
        }
      );

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Error: '{"errors":[{"code":"NAME_UNKNOWN","message":"repository "mybot" is not found"}]}',
      });
    });

    it('Incorrect credentials', async () => {
      const mockReq = {
        params: { from: 'acr', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      (fetch as jest.Mock).mockImplementation(
        (Request: string): Promise<any> => {
          return Promise.resolve({
            status: 401,
            ok: false,
            text() {
              return Promise.resolve('{"detail":"Incorrect authentication credentials"}');
            },
          });
        }
      );

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ Error: '{"detail":"Incorrect authentication credentials"}' });
    });
  });

  describe('Docker Hub', () => {
    it('Existing image', async () => {
      const mockReq = {
        params: { from: 'dockerhub', image: 'mybot' },
        query: { username: 'username', password: 'P@ssw0rd' },
        body: {},
      } as Request;

      (fetch as jest.Mock).mockImplementation(
        (Request: string): Promise<any> => {
          if (Request.indexOf('/login') > 0) {
            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({ token: 'MY BEARER TOKEN' });
              },
            });
          } else {
            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({
                  results: [{ name: 'latest' }, { name: 'v1' }, { name: 'v2' }],
                });
              },
            });
          }
        }
      );

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(['latest', 'v1', 'v2']);
    });

    it('Not found image', async () => {
      const mockReq = {
        params: { from: 'dockerhub', image: 'mybot' },
        query: { username: 'username', password: 'P@ssw0rd' },
        body: {},
      } as Request;

      (fetch as jest.Mock).mockImplementation(
        (Request: string): Promise<any> => {
          if (Request.indexOf('/login') > 0) {
            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({ token: 'MY BEARER TOKEN' });
              },
            });
          } else {
            return Promise.resolve({
              status: 200,
              ok: true,
              json() {
                return Promise.resolve({
                  results: [],
                });
              },
            });
          }
        }
      );

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('Unknown Engine', () => {
    it('Returns empty', async () => {
      const mockReq = {
        params: { from: '', image: 'mybot' },
        query: {},
        body: {},
      } as Request;

      await DockerEngineController.getTags(mockReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
