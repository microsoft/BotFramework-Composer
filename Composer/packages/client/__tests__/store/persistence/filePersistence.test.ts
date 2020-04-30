// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogInfo, LgFile, LuFile } from '@bfc/shared';

import { ActionTypes } from './../../../src/constants';
import filePersistence from './../../../src/store/persistence/FilePersistence';
import { State } from './../../../src/store/types';

jest.mock('axios', () => {
  return {
    create: jest.fn(() => {
      return {
        put: new Promise(resolve => setTimeout(() => resolve({ data: {} }), 10)),
        post: new Promise(resolve => setTimeout(() => resolve({ data: {} }), 10)),
        delete: new Promise(resolve => setTimeout(() => resolve({ data: {} }), 10)),
      };
    }),
  };
});

describe('test persistence layer', () => {
  it('test init persistence', () => {
    expect(filePersistence.projectId).toBe('');
    filePersistence.notify({} as State, {} as State, {
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response: { data: { id: 'a' } } },
    });
    expect(filePersistence.projectId).toBe('a');
  });

  it('test notify update', async () => {
    const state1 = {
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      lgFiles: [{ id: 'a.en-us', content: '' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: '' }] as LuFile[],
    } as State;

    const state2 = {
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      lgFiles: [{ id: 'a.en-us', content: 'a.lg' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a.lu' }] as LuFile[],
    } as State;

    await filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_DIALOG, payload: { id: 'a' } });
    filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_DIALOG, payload: { id: 'a' } });
    expect(JSON.parse(filePersistence.taskQueue['a.dialog'][0].change).a).toBe('a');
    filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_LG, payload: { id: 'a.en-us' } });
    expect(filePersistence.taskQueue['a.en-us.lg'][0].change).toBe('a.lg');
    filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_LU, payload: { id: 'a.en-us' } });
    expect(filePersistence.taskQueue['a.en-us.lu'][0].change).toBe('a.lu');
  });

  it('test notify create', async () => {
    const state1 = {
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as State;

    const state2 = {
      dialogs: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b' } },
      ] as DialogInfo[],
      lgFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.lg' },
      ] as LgFile[],
      luFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.lu' },
      ] as LuFile[],
    } as State;

    await filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_DIALOG, payload: { id: 'a' } });
    filePersistence.notify(state1, state2, { type: ActionTypes.CREATE_DIALOG, payload: { id: 'b' } });
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][0].change).b).toBe('b');
    expect(filePersistence.taskQueue['b.en-us.lg'][0].change).toBe('b.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][0].change).toBe('b.lu');
  });

  it('test notify remove', async () => {
    const state1 = {
      dialogs: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b.pre' } },
      ] as DialogInfo[],
      lgFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.pre.lg' },
      ] as LgFile[],
      luFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.pre.lu' },
      ] as LuFile[],
    } as State;

    const state2 = {
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as State;
    await filePersistence.notify(state1, state2, { type: ActionTypes.UPDATE_DIALOG, payload: { id: 'a' } });
    filePersistence.notify(state1, state2, { type: ActionTypes.REMOVE_DIALOG, payload: { id: 'b' } });
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][1].change).b).toBe('b.pre');
    expect(filePersistence.taskQueue['b.en-us.lg'][1].change).toBe('b.pre.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][1].change).toBe('b.pre.lu');
  });
});
