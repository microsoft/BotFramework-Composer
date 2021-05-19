// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fetch } from 'node-fetch';

import { IRepository } from '../../types/interfaces';
import { RepositoryAPIProps } from '../../types';
import { DockerHubAPI } from '../DockerHubAPI';

jest.mock('node-fetch', () => ({
  fetch: jest.fn(),
}));

describe('Test DockerHub Backend API', () => {
  let instance: IRepository;
  let Props: RepositoryAPIProps;

  beforeAll(() => {
    Props = {
      username: 'username',
      password: 'P@ssw0rd',
    };
    instance = new DockerHubAPI(Props);

    window.fetch = fetch;
  });

  describe('Environment', () => {
    it('Is Compatible', async () => {
      expect(await instance.testEnvironment()).toBeTruthy();
    });
  });

  describe('Update settings', () => {
    it('Change Username and/or Password', () => {
      instance.UpdateProps({
        username: 'otherUsername',
        password: 'otherP@ssw0rd',
      });
    });
  });

  describe('Get Tags using Composer API', () => {
    it('Valid Image', async () => {
      fetch.mockImplementation(
        (Request: string): Promise<any> => {
          return Promise.resolve({
            json() {
              return Promise.resolve(['tag1', 'tag2', 'tag3']);
            },
          });
        }
      );

      const tags: string[] = (await instance.getTags('myimage')) as string[];
      expect(tags.length).toEqual(3);
    });

    it('Invalid Image', async () => {
      fetch.mockImplementation(
        (Request: string): Promise<any> => {
          return Promise.resolve({
            json() {
              return Promise.resolve([]);
            },
          });
        }
      );

      const tags: string[] = (await instance.getTags('myimage')) as string[];
      expect(tags.length).toEqual(0);
    });
  });
});
