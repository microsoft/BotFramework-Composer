// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, FileExtensions } from '@bfc/shared';

import { luImportResolverGenerator } from '../../../src/models/bot/luResolver';

const files = [
  {
    name: 'common.en-us.lu',
    content: '> common.en-us.lu',
    path: '/users/foo/mybot/language-understanding/en-us/common.en-us.lu',
    relativePath: 'language-understanding/en-us/common.en-us.lu',
  },
  {
    name: 'greeting.en-us.lu',
    content: '> greeting.en-us.lu',
    path: '/users/foo/mybot/language-understanding/en-us/greeting.en-us.lu',
    relativePath: 'language-understanding/en-us/greeting.en-us.lu',
  },
  {
    name: 'a.en-us.lu',
    content: '> a.en-us.lu',
    path: '/users/foo/mybot/dialogs/a/language-understanding/en-us/a.en-us.lu',
    relativePath: 'dialogs/a/language-understanding/en-us/a.en-us.lu',
  },
  {
    name: 'aa.en-us.lu',
    content: '> aa.en-us.lu',
    path: '/users/foo/mybot/dialogs/a/language-understanding/en-us/imports/aa.en-us.lu',
    relativePath: 'dialogs/a/language-understanding/en-us/imports/aa.en-us.lu',
  },
  {
    name: 'b.en-us.lu',
    content: '> b.en-us.lu',
    path: '/users/foo/mybot/dialogs/b/language-understanding/en-us/b.en-us.lu',
    relativePath: 'dialogs/b/language-understanding/en-us/b.en-us.lu',
  },
] as FileInfo[];

describe('Lu Resolver', () => {
  const resolver = luImportResolverGenerator(files, FileExtensions.Lu);

  const resultOfA = {
    content: '> a.en-us.lu',
    id: '/users/foo/mybot/dialogs/a/language-understanding/en-us/a.en-us.lu',
    language: 'en-us',
  };

  const resultOfAA = {
    content: '> aa.en-us.lu',
    id: '/users/foo/mybot/dialogs/a/language-understanding/en-us/imports/aa.en-us.lu',
    language: 'en-us',
  };

  const resultOfCommon = {
    content: '> common.en-us.lu',
    id: '/users/foo/mybot/language-understanding/en-us/common.en-us.lu',
    language: 'en-us',
  };
  const resultOfGreeting = {
    content: '> greeting.en-us.lu',
    id: '/users/foo/mybot/language-understanding/en-us/greeting.en-us.lu',
    language: 'en-us',
  };

  it('should resolve ./*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: './*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfA);
  });

  it('should resolve ./**', async () => {
    const case1 = resolver('a.en-us', [{ filePath: './**', includeInCollate: true }]);
    expect(case1.length).toEqual(2);
    expect(case1[0]).toMatchObject(resultOfA);
    expect(case1[1]).toMatchObject(resultOfAA);
  });

  it('should resolve <.lu file path>/*', async () => {
    const case1 = resolver('a.en-us', [
      { filePath: '../../../../language-understanding/en-us/*', includeInCollate: true },
    ]);
    expect(case1.length).toEqual(2);
    expect(case1[0]).toMatchObject(resultOfCommon);
    expect(case1[1]).toMatchObject(resultOfGreeting);
  });

  it('should resolve <.lu file path>/**', async () => {
    const case1 = resolver('a.en-us', [
      { filePath: '../../../../language-understanding/en-us/**', includeInCollate: true },
    ]);
    expect(case1.length).toEqual(2);
    expect(case1[0]).toMatchObject(resultOfCommon);
    expect(case1[1]).toMatchObject(resultOfGreeting);
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
      { filePath: '../../../../language-understanding/en-us/common.lu', includeInCollate: true },
    ]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toMatchObject(resultOfCommon);
  });

  it('should resolve <.lu file path> with locale', async () => {
    const case1 = resolver('a.en-us', [
      { filePath: '../../../../language-understanding/en-us/common.en-us.lu', includeInCollate: true },
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
