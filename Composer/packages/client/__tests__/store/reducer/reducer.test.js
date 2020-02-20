// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes, FileTypes } from '../../../src/constants/index';
import { reducer } from '../../../src/store/reducer/index';

const mockResponse = {
  data: {
    dialogs: ['test dialogs'],
    lgFiles: ['test lgFiles'],
    schemas: 'test schemas',
  },
};

describe('test all reducer handlers', () => {
  it('test getProjectSuccess reducer', () => {
    const result = reducer({}, { type: ActionTypes.GET_PROJECT_SUCCESS, payload: { response: mockResponse } });
    expect(result.dialogs[0]).toBe('test dialogs');
    expect(result.lgFiles[0]).toBe('test lgFiles');
    expect(result.schemas).toBe('test schemas');
  });
  it('test createDialogSuccess reducer', () => {
    const result = reducer({}, { type: ActionTypes.CREATE_DIALOG_SUCCESS, payload: { response: mockResponse } });
    expect(result.dialogs[0]).toBe('test dialogs');
  });
  it('test updateLgTemplate reducer', () => {
    const result = reducer(
      { lgFiles: [{ id: 'common.lg', content: 'test lgFiles' }] },
      {
        type: ActionTypes.UPDATE_LG_SUCCESS,
        payload: {
          id: 'common.lg',
          content: ` # bfdactivity-003038
        - You said '@{turn.activity.text}'`,
        },
      }
    );
    expect(result.lgFiles[0].templates.length).toBe(1);
  });

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
