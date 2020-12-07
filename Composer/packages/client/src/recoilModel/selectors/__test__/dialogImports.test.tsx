// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getBaseName } from '../../../utils/fileUtil';
import { getLanguageFileImports } from '../dialogImports';

const files = [
  {
    id: 'name1.lg',
    content: '[display-name2.lg](../files/name2.lg)\n[display-name3.lg](../files/name3.lg)\n',
  },
  {
    id: 'id',
    content: '',
  },
  {
    id: 'gender',
    content: '',
  },
  {
    id: 'name2',
    content: '[display-name4.lg](../files/name4.lg)\n[display-name5-entity.lg](../files/name5-entity.lg)\n',
  },
  {
    id: 'name3',
    content: '- Enter a value for name3',
  },
  {
    id: 'name4',
    content: '[display-name5-entity.lg](../files/name5-entity.lg)',
  },
  {
    id: 'name5-entity',
    content: '- Enter a value for name5',
  },
];

describe('dialogImports selectors', () => {
  it('should follow all imports and list all unique imports', () => {
    const getFile = (id) => files.find((f) => getBaseName(f.id) === id) as { id: string; content: string };

    const fileImports = getLanguageFileImports('name1', getFile);
    expect(fileImports).toEqual([
      {
        displayName: 'display-name2.lg',
        id: 'name2',
        importPath: '../files/name2.lg',
      },
      {
        displayName: 'display-name3.lg',
        id: 'name3',
        importPath: '../files/name3.lg',
      },
      {
        displayName: 'display-name4.lg',
        id: 'name4',
        importPath: '../files/name4.lg',
      },
      {
        displayName: 'display-name5-entity.lg',
        id: 'name5-entity',
        importPath: '../files/name5-entity.lg',
      },
    ]);
  });
});
