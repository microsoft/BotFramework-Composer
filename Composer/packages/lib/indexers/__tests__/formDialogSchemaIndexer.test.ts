// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { formDialogSchemaIndexer } from '../src/formDialogSchemaIndexer';

const files: FileInfo[] = [
  { name: 'file1.json', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file2.dialog', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file3.form', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file4.lu', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file5.lg', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file6.botproj', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file7.qna', content: '', lastModified: '', relativePath: '', path: '' },
  { name: 'file8.form', content: '', lastModified: '', relativePath: '', path: '' },
];

const expected = [
  { id: 'file3', content: '' },
  { id: 'file8', content: '' },
];

const { index } = formDialogSchemaIndexer;

describe('formDialogSchemaIndexer', () => {
  it('Should return form dialog schema files', () => {
    const formDialogSchemas = index(files);

    expect(formDialogSchemas.length).toBe(2);
    expect(formDialogSchemas).toEqual(expected);
  });
});
