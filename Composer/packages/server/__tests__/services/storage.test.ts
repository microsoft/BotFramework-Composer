/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { Path } from '../../src/utility/path';
import StorageService from '../../src/services/storage';
jest.mock('azure-storage', () => {
  return {
    createBlobService: (_account: string, _key: string) => {
      return {
        listContainersSegmented: () => {
          return { containers: [] };
        },
        listBlobsSegmented: () => {
          return { blobs: [] };
        },
      };
    },
  };
});
jest.mock('../../src/store/store', () => {
  const data = [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: '.',
    },
  ];
  return {
    Store: {
      get: (_key: string) => data,
      set: (key: string, value: any) => {
        console.log(`set ${value} in store`);
      },
    },
  };
});
describe('test StorageService', () => {
  it('getStorageConnections', () => {
    const result = StorageService.getStorageConnections();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe('default');
    expect(result[0].type).toBe('LocalDisk');
    expect(result[0].path).toBe(Path.resolve('.'));
  });
  it('checkBlob', async () => {
    const result = await StorageService.checkBlob('default', Path.resolve('.'));
    expect(result).toBeTruthy();
  });
  it('getBlob', async () => {
    const result = await StorageService.getBlob('default', Path.resolve('.'));
    expect(result).not.toBeUndefined();
    expect(result.children).not.toBeUndefined();
  });
});
