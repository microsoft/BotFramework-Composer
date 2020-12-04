// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getBaseName } from '../../../utils/fileUtil';
import { getLanguageFileImports } from '../dialogImports';

const files = [
  {
    id: 'name1.lg',
    content: '[name2.lg](../files/name2.lg)\n[name3.lg](../files/name3.lg)\n',
  },
  {
    id: 'id.lg',
    content: '',
  },
  {
    id: 'gender.lg',
    content: '',
  },
  {
    id: 'name2.lg',
    content: '[name4.lg](../files/name4.lg)\n[name5-entity.lg](../files/name5-entity.lg)\n',
  },
  {
    id: 'name3.lg',
    content: '- Enter a value for name3',
  },
  {
    id: 'name4.lg',
    content: '[name5-entity.lg](../files/name5-entity.lg)',
  },
  {
    id: 'name5-entity.lg',
    content: '- Enter a value for name5',
  },
];

describe('dialogImports selectors', () => {
  it('should follow all imports and list all unique imports', () => {
    const getFile = (id) => files.find((f) => getBaseName(f.id) === id) as { id: string; content: string };

    const fileImports = getLanguageFileImports('name1', getFile);
    expect(fileImports).toEqual([
      {
        id: 'name2.lg',
        content: '[name4.lg](../files/name4.lg)\n[name5-entity.lg](../files/name5-entity.lg)\n',
      },
      {
        id: 'name3.lg',
        content: '- Enter a value for name3',
      },
      {
        id: 'name4.lg',
        content: '[name5-entity.lg](../files/name5-entity.lg)',
      },
      {
        id: 'name5-entity.lg',
        content: '- Enter a value for name5',
      },
    ]);
  });
});
