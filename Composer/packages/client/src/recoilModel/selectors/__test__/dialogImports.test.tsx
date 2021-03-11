// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lgUtil } from '@bfc/indexers';

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
    const getFile = (id) => {
      const file = files.find((f) => getBaseName(f.id) === id);
      if (file) {
        return lgUtil.parse(file.id, file.content, []);
      } else {
        throw new Error(`file ${id} not found`);
      }
    };

    const fileImports = getLanguageFileImports('name1', getFile);
    expect(fileImports).toEqual([
      {
        displayName: 'name2',
        id: 'name2',
        importPath: '../files/name2.lg',
      },
      {
        displayName: 'name3',
        id: 'name3',
        importPath: '../files/name3.lg',
      },
      {
        displayName: 'name4',
        id: 'name4',
        importPath: '../files/name4.lg',
      },
      {
        displayName: 'name5-entity',
        id: 'name5-entity',
        importPath: '../files/name5-entity.lg',
      },
    ]);
  });
});
