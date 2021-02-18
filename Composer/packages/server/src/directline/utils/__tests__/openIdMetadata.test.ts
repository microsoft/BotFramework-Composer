/* eslint-disable @typescript-eslint/camelcase */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenIdMetadata } from '../openIdMetaData';

const mockGetResponse = jest.fn();

jest.mock('axios', () => ({
  get: (...args) => mockGetResponse(...args),
}));

jest.mock('base64url', () => ({
  toBase64: jest.fn((value) => `${value}_base64`),
}));
jest.mock('rsa-pem-from-mod-exp', () => jest.fn((n, e) => `${n}_${e}_pem`));

describe('OpenIdMetadata', () => {
  it('should get a key and refresh cache if last updated more than 5 days ago', async () => {
    const mockRefreshCache = jest.fn(() => Promise.resolve());
    const mockFindKey = jest.fn(() => 'someKey');
    const openIdMetadata = new OpenIdMetadata('');
    // ensure that the last time the keys were updated was more than 5 days ago
    const lastUpdated = new Date().getTime() - 1000 * 60 * 60 * 24 * 6;
    (openIdMetadata as any).lastUpdated = lastUpdated;
    (openIdMetadata as any).refreshCache = mockRefreshCache;
    (openIdMetadata as any).findKey = mockFindKey;
    const key = await openIdMetadata.getKey('someKeyId');

    expect(mockRefreshCache).toHaveBeenCalled();
    expect(mockFindKey).toHaveBeenCalledWith('someKeyId');
    expect(key).toBe('someKey');
  });

  it('should refresh the cache', async () => {
    mockGetResponse
      .mockResolvedValueOnce({
        data: { jwks_uri: 'someJwksUri' },
      })
      .mockResolvedValueOnce({
        data: { keys: ['key1', 'key2', 'key3'] },
      });

    const timeBeforeRefresh = new Date().getTime() - 1000;
    const openIdMetadata = new OpenIdMetadata('someUrl');
    await (openIdMetadata as any).refreshCache();

    expect(mockGetResponse).toHaveBeenCalledWith('someUrl');
    expect(mockGetResponse).toHaveBeenCalledWith('someJwksUri');
    expect((openIdMetadata as any).lastUpdated).toBeGreaterThan(timeBeforeRefresh);
    expect((openIdMetadata as any).keys).toEqual(['key1', 'key2', 'key3']);
  });

  it('should throw when failing to get the openId config during a cache refresh', async () => {
    mockGetResponse.mockResolvedValueOnce({
      status: 401,
    });
    const openIdMetadata = new OpenIdMetadata('someUrl');

    await expect((openIdMetadata as any).refreshCache()).rejects.toThrowError('Failed to load openID config: 401');
  });

  it('should throw when failing to get the keys during a cache refresh', async () => {
    mockGetResponse.mockImplementation((props) => {
      if (props === 'testUrl') {
        return new Promise((resolve) => {
          resolve({
            status: 200,
            data: { jwks_uri: 'someJwksUri' },
          });
        });
      } else if (props === 'someJwksUri') {
        return new Promise((resolve, reject) => {
          resolve({
            status: 404,
            data: { jwks_uri: 'someJwksUri' },
          });
        });
      }
    });

    const openIdMetadata = new OpenIdMetadata('testUrl');

    await expect((openIdMetadata as any).refreshCache()).rejects.toThrowError('Failed to load Keys: 404');
  });

  it('should find a key', () => {
    const keyId = 'someKeyId';
    const openIdMetadata = new OpenIdMetadata('');
    const key = {
      kid: keyId,
      n: 'someN',
      e: 'someE',
    };
    (openIdMetadata as any).keys = [key];
    const retrievedKey = (openIdMetadata as any).findKey(keyId);
    expect(retrievedKey).toBe('someN_base64_someE_pem');
  });

  it('should return null when trying to find keys if the keys array is undefined', () => {
    const openIdMetadata = new OpenIdMetadata('');
    (openIdMetadata as any).keys = undefined;
    expect((openIdMetadata as any).findKey('someKeyId')).toBe(null);
  });

  it('should return null when trying to find a non-RSA key', () => {
    const keyId1 = 'someKeyId1';
    const keyId2 = 'someKeyId2';
    const openIdMetadata = new OpenIdMetadata('');
    const key1 = {
      kid: keyId1,
      n: 'someN',
    };
    const key2 = {
      kid: keyId2,
      e: 'someE',
    };
    (openIdMetadata as any).keys = [key1, key2];
    // no e
    const retrievedKey1 = (openIdMetadata as any).findKey(keyId1);

    expect(retrievedKey1).toBe(null);

    // no n
    const retrievedKey2 = (openIdMetadata as any).findKey(keyId2);

    expect(retrievedKey2).toBe(null);
  });

  it('should return null if it cannot find the specified key', () => {
    const openIdMetadata = new OpenIdMetadata('');
    (openIdMetadata as any).keys = [];
    expect((openIdMetadata as any).findKey('someKeyId')).toBe(null);
  });
});
