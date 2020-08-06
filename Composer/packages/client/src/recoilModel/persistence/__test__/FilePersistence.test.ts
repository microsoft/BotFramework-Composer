// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogInfo, DialogSchemaFile, LgFile, LuFile, BotAssets } from '@bfc/shared';

import filePersistence from '../FilePersistence';

jest.mock('axios', () => {
  return {
    create: jest.fn(() => {
      return {
        put: new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 10)),
        post: new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 10)),
        delete: new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 10)),
      };
    }),
  };
});

describe('test persistence layer', () => {
  it('test init persistence', async () => {
    expect(filePersistence.projectId).toBe('');
    const current = { projectId: '' } as BotAssets;
    const previous = { projectId: '' } as BotAssets;
    await filePersistence.notify(current, previous);
    expect(filePersistence.projectId).toBe('');
    current.projectId = 'test';
    await filePersistence.notify(current, previous);
    expect(filePersistence.projectId).toBe('test');
  });

  it('test notify update', async () => {
    const previous = {
      projectId: 'test',
      dialogs: [{ id: 'a', content: { a: 'old' } }] as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'old schema' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: '' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: '' }] as LuFile[],
    } as BotAssets;

    const current = {
      projectId: 'test',
      dialogs: [{ id: 'a', content: { a: 'new' } }] as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'new schema' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a.lg' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a.lu' }] as LuFile[],
    } as BotAssets;

    filePersistence.notify(current, previous);
    filePersistence.notify(current, previous);
    expect(JSON.parse(filePersistence.taskQueue['a.dialog'][0].change).a).toBe('new');
    expect(JSON.parse(filePersistence.taskQueue['a.dialog.schema'][0].change).a).toBe('new schema');
    expect(filePersistence.taskQueue['a.en-us.lg'][0].change).toBe('a.lg');
    expect(filePersistence.taskQueue['a.en-us.lu'][0].change).toBe('a.lu');
  });

  it('test notify create', async () => {
    const previous = {
      projectId: 'test',
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'a' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as BotAssets;

    const current = {
      projectId: 'test',
      dialogs: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b' } },
      ] as DialogInfo[],
      dialogSchemas: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b' } },
      ] as DialogSchemaFile[],
      lgFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.lg' },
      ] as LgFile[],
      luFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.lu' },
      ] as LuFile[],
    } as BotAssets;

    filePersistence.notify(current, previous);
    filePersistence.notify(current, previous);
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][0].change).b).toBe('b');
    expect(JSON.parse(filePersistence.taskQueue['b.dialog.schema'][0].change).b).toBe('b');
    expect(filePersistence.taskQueue['b.en-us.lg'][0].change).toBe('b.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][0].change).toBe('b.lu');
  });

  it('test notify remove', async () => {
    const previous = {
      projectId: 'test',
      dialogs: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b.pre' } },
      ] as DialogInfo[],
      dialogSchemas: [
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b.pre' } },
      ] as DialogSchemaFile[],
      lgFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.pre.lg' },
      ] as LgFile[],
      luFiles: [
        { id: 'a.en-us', content: 'a' },
        { id: 'b.en-us', content: 'b.pre.lu' },
      ] as LuFile[],
    } as BotAssets;

    const current = {
      projectId: 'test',
      dialogs: [{ id: 'a', content: { a: 'a' } }] as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'a' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as BotAssets;
    filePersistence.notify(current, previous);
    filePersistence.notify(current, previous);
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][0].change).b).toBe('b.pre');
    expect(filePersistence.taskQueue['b.en-us.lg'][0].change).toBe('b.pre.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][0].change).toBe('b.pre.lu');
  });
});
