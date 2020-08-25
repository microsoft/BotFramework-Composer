// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { luImportResolverGenerator } from '../../../src/models/bot/luResolver';

const files = [
  {
    name: 'common.en-us.lu',
    content: '> common.en-us.lu',
    path: '/users/foo/mybot/language-understanding/en-us/common.en-us.lu',
    relativePath: 'language-understanding/en-us/common.en-us.lu',
  },
  {
    name: 'a.en-us.lu',
    content: '> a.en-us.lu',
    path: '/users/foo/mybot/dialogs/a/language-understanding/en-us/a.en-us.lu',
    relativePath: 'dialogs/a/language-understanding/en-us/a.en-us.lu',
  },
  {
    name: 'b.en-us.lu',
    content: '> b.en-us.lu',
    path: '/users/foo/mybot/dialogs/b/language-understanding/en-us/b.en-us.lu',
    relativePath: 'dialogs/b/language-understanding/en-us/b.en-us.lu',
  },
] as FileInfo[];

describe('Lu Resolver', () => {
  const resolver = luImportResolverGenerator(files);

  const resultOfCommon = {
    content: '> common.en-us.lu',
    id: '/users/foo/mybot/language-understanding/en-us/common.en-us.lu',
    language: 'en-us',
  };

  it('should resolve ./*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: './*', includeInCollate: true }]);
    expect(case1.length).toEqual(3);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file id> no locale', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file id> with locale', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.en-us.lu', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path> no locale', async () => {
    const case1 = resolver('a.en-us', [
      { filePath: '../../../../../language-understanding/en-us/common.lu', includeInCollate: true },
    ]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path> with locale', async () => {
    const case1 = resolver('a.en-us', [
      { filePath: '../../../../../language-understanding/en-us/common.en-us.lu', includeInCollate: true },
    ]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#*utterances*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*utterances*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#*patterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*patterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#*utterancesAndPatterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*utterancesAndPatterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#<INTENT-NAME>', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#Help', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#<INTENT-NAME>*utterances*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#Help*utterances*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path>#<INTENT-NAME>*patterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#Help*patterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });
});
