// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogInfo, DialogSchemaFile, LgFile, LuFile, BotAssets } from '@bfc/shared';

import FilePersistence from '../FilePersistence';
const projectId = '2123.2234as';

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

jest.mock('../../parsers/fileDiffCalculator', () => {
  return {
    difference: require('../../parsers/workers/calculator.worker').getDifferenceItems,
  };
});

describe('test persistence layer', () => {
  let filePersistence: FilePersistence;
  beforeEach(() => {
    filePersistence = new FilePersistence(projectId);
  });

  it('test notify update', async () => {
    const previous = {
      projectId: 'test',
      dialogs: [] as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'old schema' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: '' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: '' }] as LuFile[],
      crossTrainConfig: { 'cross-train.config.json': { rootBot: false } } as any,
    } as BotAssets;

    const current = {
      projectId: 'test',
      dialogs: ([{ id: 'a', content: { a: 'create' } }] as unknown) as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'new schema' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a.lg' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a.lu' }] as LuFile[],
      crossTrainConfig: { 'cross-train.config.json': { rootBot: true } } as any,
    } as BotAssets;

    const last = {
      projectId: 'test',
      dialogs: ([{ id: 'a', content: { a: 'update' } }] as unknown) as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'new schema' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a.lg' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a.lu' }] as LuFile[],
      crossTrainConfig: { 'cross-train.config.json': { rootBot: true } } as any,
    } as BotAssets;

    const result = await filePersistence.getAssetsChanges(current, previous);
    filePersistence.createTaskQueue(result);
    expect(JSON.parse(filePersistence.taskQueue['a.dialog'][0].change).a).toBe('create');
    expect(JSON.parse(filePersistence.taskQueue['a.dialog.schema'][0].change).a).toBe('new schema');
    expect(filePersistence.taskQueue['a.en-us.lg'][0].change).toBe('a.lg');
    expect(filePersistence.taskQueue['a.en-us.lu'][0].change).toBe('a.lu');
    const result1 = await filePersistence.getAssetsChanges(last, current);
    filePersistence.createTaskQueue(result1);
    filePersistence.flush();
    filePersistence.flush();
    expect(filePersistence.taskQueue['a.en-us.lu'].length).toBe(0);
  });

  it('test notify create', async () => {
    const previous = {
      projectId: 'test',
      dialogs: ([{ id: 'a', content: { a: 'a' } }] as unknown) as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'a' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as BotAssets;

    const current = {
      projectId: 'test',
      dialogs: ([
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b' } },
      ] as unknown) as DialogInfo[],
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

    const result = await filePersistence.getAssetsChanges(current, previous);
    filePersistence.createTaskQueue(result);
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][0].change).b).toBe('b');
    expect(JSON.parse(filePersistence.taskQueue['b.dialog.schema'][0].change).b).toBe('b');
    expect(filePersistence.taskQueue['b.en-us.lg'][0].change).toBe('b.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][0].change).toBe('b.lu');
    await filePersistence.flush();
    expect(filePersistence.taskQueue['b.en-us.lu'].length).toBe(0);
  });

  it('test notify remove', async () => {
    const previous = {
      projectId: 'test',
      dialogs: ([
        { id: 'a', content: { a: 'a' } },
        { id: 'b', content: { b: 'b.pre' } },
      ] as unknown) as DialogInfo[],
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
      dialogs: ([{ id: 'a', content: { a: 'a' } }] as unknown) as DialogInfo[],
      dialogSchemas: [{ id: 'a', content: { a: 'a' } }] as DialogSchemaFile[],
      lgFiles: [{ id: 'a.en-us', content: 'a' }] as LgFile[],
      luFiles: [{ id: 'a.en-us', content: 'a' }] as LuFile[],
    } as BotAssets;
    const result = await filePersistence.getAssetsChanges(current, previous);
    filePersistence.createTaskQueue(result);
    expect(JSON.parse(filePersistence.taskQueue['b.dialog'][0].change).b).toBe('b.pre');
    expect(filePersistence.taskQueue['b.en-us.lg'][0].change).toBe('b.pre.lg');
    expect(filePersistence.taskQueue['b.en-us.lu'][0].change).toBe('b.pre.lu');
    await filePersistence.flush();
    expect(filePersistence.taskQueue['b.en-us.lu'].length).toBe(0);
  });
});
