// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import filePersistence from './../../../src/store/persistence/FilePersistence';
import { FileChangeType, FileExtensions } from './../../../src/store/persistence/types';

jest.mock('axios', () => {
  return {
    create: jest.fn(() => {
      return {
        put: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn((url, data) => Promise.resolve({ data })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
      };
    }),
  };
});

const files = [
  {
    name: 'a.dialog',
    content: '',
    lastModified: 'Tue Mar 31 2020 23:08:15 GMT+0800 (GMT+08:00)',
    path: 'C:/a.dialog',
    relativePath: 'a.dialog',
  },
  {
    name: 'a.en-us.lg',
    content: '',
    lastModified: 'Tue Mar 31 2020 23:08:15 GMT+0800 (GMT+08:00)',
    path: 'C:/a.dialog',
    relativePath: 'a.en-us.lg',
  },
  {
    name: 'a.en-us.lu',
    content: '',
    lastModified: 'Tue Mar 31 2020 23:08:15 GMT+0800 (GMT+08:00)',
    path: 'C:/a.en-us.lu',
    relativePath: 'a.en-us.lu',
  },
];

describe('test persistence layer', () => {
  it('test attach file', () => {
    expect(Object.keys(filePersistence.files).length).toBe(0);
    expect(filePersistence.projectId).toBe('');
    filePersistence.projectId = 'projectId';
    files.forEach(file => filePersistence.attach(file.name, file));
    expect(Object.keys(filePersistence.files).length).toBe(3);
  });

  it('test notify update', async () => {
    filePersistence.notify(FileChangeType.UPDATE, 'a', FileExtensions.Dialog, { a: 'a' });
    filePersistence.notify(FileChangeType.UPDATE, 'a.en-us', FileExtensions.Lu, 'a');
    filePersistence.notify(FileChangeType.UPDATE, 'a.en-us', FileExtensions.Lg, 'a');
    await new Promise(res =>
      setTimeout(() => {
        const dialog = filePersistence.files['a.dialog'].file;
        const lg = filePersistence.files['a.en-us.lg'].file;
        const lu = filePersistence.files['a.en-us.lu'].file;
        expect(dialog).toBeDefined();
        if (dialog) {
          expect(JSON.parse(dialog.content).a).toBe('a');
        }
        expect(lg).toBeDefined();
        if (lg) {
          expect(lg.content).toBe('a');
        }
        expect(lu).toBeDefined();
        if (lu) {
          expect(lu.content).toBe('a');
        }
        res();
      }, 501)
    );
  });

  it('test notify create', async () => {
    await filePersistence.notify(FileChangeType.CREATE, 'b', FileExtensions.Dialog, { b: 'b' });
    await filePersistence.notify(FileChangeType.CREATE, 'b.en-us', FileExtensions.Lu, 'b');
    await filePersistence.notify(FileChangeType.CREATE, 'b.en-us', FileExtensions.Lg, 'b');
    const dialog = filePersistence.files['b.dialog'].file;
    const lg = filePersistence.files['b.en-us.lg'].file;
    const lu = filePersistence.files['b.en-us.lu'].file;
    expect(dialog).toBeDefined();
    if (dialog) {
      expect(JSON.parse(dialog.content).b).toBe('b');
    }
    expect(lg).toBeDefined();
    if (lg) {
      expect(lg.content).toBe('b');
    }
    expect(lu).toBeDefined();
    if (lu) {
      expect(lu.content).toBe('b');
    }
  });

  it('test notify remove', async () => {
    await filePersistence.notify(FileChangeType.DELETE, 'b', FileExtensions.Dialog, '');
    await filePersistence.notify(FileChangeType.DELETE, 'b.en-us', FileExtensions.Lu, '');
    await filePersistence.notify(FileChangeType.DELETE, 'b.en-us', FileExtensions.Lg, '');
    const dialog = filePersistence.files['b.dialog'];
    const lg = filePersistence.files['b.en-us.lg'];
    const lu = filePersistence.files['b.en-us.lu'];
    expect(dialog).toBeUndefined();
    expect(lg).toBeUndefined();
    expect(lu).toBeUndefined();
  });
  it('test detach', async () => {
    filePersistence.detach('a.dialog');
    expect(filePersistence.files['a.dialog']).toBeUndefined();
  });
  it('test clear', async () => {
    filePersistence.clear();
    expect(Object.keys(filePersistence.files).length).toBe(0);
  });
});
