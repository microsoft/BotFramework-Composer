import nanoid from 'nanoid';

import ApiClient from '../../src/messenger/ApiClient';

jest.mock('nanoid');

(nanoid as jest.Mock).mockReturnValue('uniqueId');

// @ts-ignore
const mockWindow = new Window({ parsingMode: 'html' });
mockWindow.postMessage = jest.fn().mockImplementation((data, origin) => {
  const evt = new MessageEvent('message', { data, origin, source: mockWindow });

  mockWindow.dispatchEvent(evt);
});

describe('ApiClient', () => {
  let client;

  beforeEach(() => {
    client = new ApiClient(mockWindow);
    client.connect();
  });

  afterEach(() => {
    client.disconnect();
  });

  it('can register and invoke a sync api', async () => {
    const add = data => {
      return data.x + data.y;
    };

    client.registerApi('add', add);

    const res = await client.apiCall('add', { x: 3, y: 4 }, mockWindow);
    expect(res).toEqual(7);
  });

  it('can register and invoke an async api', async () => {
    const add = data => {
      return Promise.resolve(data.x + data.y);
    };

    client.registerApi('add', add);

    const res = await client.apiCall('add', { x: 3, y: 4 }, mockWindow);
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
      await client.apiCall('syncError', undefined, mockWindow);
    } catch (sErr) {
      expect(sErr).toBe('SomeError');
    }

    try {
      await client.apiCall('asyncError', undefined, mockWindow);
    } catch (asErr) {
      expect(asErr).toBe('SomeError');
    }
  });
});
