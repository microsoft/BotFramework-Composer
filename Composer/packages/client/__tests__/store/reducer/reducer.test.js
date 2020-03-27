// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes, FileTypes } from '../../../src/constants/index';
import { reducer } from '../../../src/store/reducer/index';

const mockResponse = {
  data: {
    files: ['test files'],
    schemas: 'test schemas',
  },
};

describe('test all reducer handlers', () => {
  it('test getStorageFileSuccess reducer', () => {
    const mockStorageFile = {
      data: {
        children: [
          {
            type: FileTypes.FOLDER,
            path: 'mock path',
          },
          {
            type: FileTypes.FILE,
            path: 'a.bot',
          },
          {
            type: FileTypes.FILE,
            path: 'mock path',
          },
        ],
      },
    };
    const result = reducer({}, { type: ActionTypes.GET_STORAGEFILE_SUCCESS, payload: { response: mockStorageFile } });
    expect(result.storageFileLoadingStatus).toBe('success');
    expect(result.focusedStorageFolder).toEqual(expect.objectContaining({ children: expect.any(Array) }));
    expect(result.focusedStorageFolder.children).toHaveLength(2);
  });
});
