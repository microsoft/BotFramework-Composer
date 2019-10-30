// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import nanoid from 'nanoid';

import ApiClient from '../../src/messenger/ApiClient';

jest.mock('nanoid');

(nanoid as jest.Mock).mockReturnValue('uniqueId');

const oldPostMessage = window.postMessage;

describe('ApiClient', () => {
  let client;

  beforeEach(() => {
    window.postMessage = (data, origin) => {
      const evt = new MessageEvent('message', { data, origin, source: window });

      window.dispatchEvent(evt);
    };

    client = new ApiClient();
    client.connect();
  });

  afterEach(() => {
    client.disconnect();
    window.postMessage = oldPostMessage;
  });

  it('can register and invoke a sync api', async () => {
    const add = data => {
      return data.x + data.y;
    };

    client.registerApi('add', add);

    const res = await client.apiCall('add', { x: 3, y: 4 });
    expect(res).toEqual(7);
  });

  it('can register and invoke an async api', async () => {
    const add = data => {
      return Promise.resolve(data.x + data.y);
    };

    client.registerApi('add', add);

    const res = await client.apiCall('add', { x: 3, y: 4 });
    expect(res).toEqual(7);
  });

  it('handles when the api throws an error', async () => {
    const err = new Error('SomeError');
    const syncError = () => {
      throw err;
    };

    const asyncError = () => {
      return Promise.reject(err);
    };

    client.registerApi('syncError', syncError);
    client.registerApi('asyncError', asyncError);

    try {
      await client.apiCall('syncError');
    } catch (sErr) {
      expect(sErr).toBe('SomeError');
    }

    try {
      await client.apiCall('asyncError');
    } catch (asErr) {
      expect(asErr).toBe('SomeError');
    }
  });
});
