// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResolverResource } from '@bfc/shared';

import { luImportResolverGenerator } from '../../../src/models/bot/luResolver';

const files = [
  {
    id: 'common.en-us',
    content: '> common.en-us.lu',
  },
  {
    id: 'a.en-us',
    content: '> a.en-us.lu',
  },
  {
    id: 'b.en-us',
    content: '> b.en-us.lu',
  },
] as ResolverResource[];

describe('Lu Resolver', () => {
  const resolver = luImportResolverGenerator(files);

  it('should resolve <.lu file id> without locale', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file id> with locale', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.en-us.lu', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common.en-us',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.en-us.lu',
    });
  });

  it('should resolve <.lu file path>', async () => {
    const case1 = resolver('a.en-us', [{ filePath: './common.lu', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#*utterances*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*utterances*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#*patterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*patterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#*utterancesAndPatterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#*utterancesAndPatterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#<INTENT-NAME>', async () => {
    const case1 = resolver('a.en-us', [{ filePath: './common.lu#Help', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#<INTENT-NAME>*utterances*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#Help*utterances*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });

  it('should resolve <.lu file path>#<INTENT-NAME>*patterns*', async () => {
    const case1 = resolver('a.en-us', [{ filePath: 'common.lu#Help*patterns*', includeInCollate: true }]);
    expect(case1.length).toEqual(1);
    expect(case1[0]).toEqual({
      content: '> common.en-us.lu',
      id: 'common',
      includeInCollate: true,
      language: 'en-us',
      path: '',
      name: 'common.en-us.lu',
    });
  });
});
