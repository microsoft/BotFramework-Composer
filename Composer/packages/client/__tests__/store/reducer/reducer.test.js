// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes, FileTypes } from '../../../src/constants/index';
import { reducer } from '../../../src/store/reducer/index';

const mockResponse = {
  data: {
    files: ['test files'],
    schemas: 'test schemas'
  }
};

describe('test all reducer handlers', () => {
  it('test getStorageFileSuccess reducer', () => {
    const mockStorageFile = {
      data: {
        children: [
          {
            type: FileTypes.FOLDER,
            path: 'mock path'
          },
          {
            type: FileTypes.FILE,
            path: 'a.bot'
          },
          {
            type: FileTypes.FILE,
            path: 'mock path'
          }
        ]
      }
    };
    const result = reducer({}, { type: ActionTypes.GET_STORAGEFILE_SUCCESS, payload: { response: mockStorageFile } });
    expect(result.storageFileLoadingStatus).toBe('success');
    expect(result.focusedStorageFolder).toEqual(expect.objectContaining({ children: expect.any(Array) }));
    expect(result.focusedStorageFolder.children).toHaveLength(2);
  });

  it('remove lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1' }, { id: '2' }] },
      { type: ActionTypes.REMOVE_LG, payload: { id: '1' } }
    );
    expect(result.lgFiles.length).toBe(1);
    expect(result.lgFiles[0].id).toBe('2');
  });

  it('create lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1' }, { id: '2' }], locale: 'en-us' },
      { type: ActionTypes.CREATE_LG, payload: { id: '3', content: '' } }
    );
    expect(result.lgFiles.length).toBe(3);
    expect(result.lgFiles[2].id).toBe('3.en-us');
  });

  it('update lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1', content: 'old' }, { id: '2' }] },
      { type: ActionTypes.UPDATE_LG, payload: { id: '1', content: 'new' } }
    );
    expect(result.lgFiles.length).toBe(2);
    expect(result.lgFiles[0].content).toBe('new');
  });

  it('remove dialog file', () => {
    const result = reducer(
      { dialogs: [{ id: '1' }, { id: '2' }], lgFiles: [{ id: '1' }], luFiles: [{ id: '1' }] },
      { type: ActionTypes.REMOVE_DIALOG, payload: { id: '1' } }
    );
    expect(result.dialogs.length).toBe(1);
    expect(result.dialogs[0].id).toBe('2');
    expect(result.luFiles.length).toBe(0);
    expect(result.lgFiles.length).toBe(0);
  });

  it('create dialog file', () => {
    const result = reducer(
      {
        dialogs: [{ id: '1' }, { id: '2' }],
        locale: 'en-us',
        lgFiles: [],
        luFiles: [],
        schemas: { sdk: { content: {} } }
      },
      { type: ActionTypes.CREATE_DIALOG, payload: { id: '3', content: '' } }
    );
    expect(result.dialogs.length).toBe(3);
    expect(result.dialogs[2].id).toBe('3');
    expect(result.luFiles.length).toBe(1);
    expect(result.lgFiles.length).toBe(1);
  });

  it('update dialog file', () => {
    const result = reducer(
      { dialogs: [{ id: '1', content: 'old' }, { id: '2' }], schemas: { sdk: { content: {} } } },
      { type: ActionTypes.UPDATE_DIALOG, payload: { id: '1', content: 'new' } }
    );
    expect(result.dialogs.length).toBe(2);
    expect(result.dialogs[0].content).toBe('new');
  });
});
