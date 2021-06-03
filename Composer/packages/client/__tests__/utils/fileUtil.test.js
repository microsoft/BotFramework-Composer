// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getExtension, getBaseName, upperCaseName, loadLocale, getUniqueName } from '../../src/utils/fileUtil';
import httpClient from '../../src/utils/httpUtil';

jest.mock('../../src/utils/httpUtil');

const files = ['a.text', 'a.b.text', 1];

describe('getExtension', () => {
  it('returns extension', () => {
    const result1 = getExtension(files[0]);
    expect(result1).toEqual('text');
    const result2 = getExtension(files[1]);
    expect(result2).toEqual('text');
    const result3 = getExtension(files[2]);
    expect(result3).toEqual(1);
  });
});

describe('getBaseName', () => {
  it('returns basename', () => {
    const result1 = getBaseName(files[0]);
    expect(result1).toEqual('a');
    const result2 = getBaseName(files[1]);
    expect(result2).toEqual('a.b');
    const result3 = getBaseName(files[2]);
    expect(result3).toEqual(1);
  });
});

describe('upperCaseName', () => {
  it('returns upper case name', () => {
    const result1 = upperCaseName(files[0]);
    expect(result1).toEqual('A.text');
    const result2 = upperCaseName(files[1]);
    expect(result2).toEqual('A.b.text');
    const result3 = upperCaseName(files[2]);
    expect(result3).toEqual(1);
  });
});

describe('loadLocale', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  const LOCALE = 'en-test';
  it("does not set locale if it can't find one", async () => {
    jest.spyOn(httpClient, 'get').mockImplementation(() => ({ data: null }));

    expect(await loadLocale(LOCALE)).toBeNull();
  });
  it('does not set locale if the server returns an error page', async () => {
    jest.spyOn(httpClient, 'get').mockImplementation(() => ({ data: 'error page' }));

    expect(await loadLocale(LOCALE)).toBeNull();
  });
  it('sets locale if it does find one', async () => {
    const RESPONSE = { data: { abc: 'def' } };

    jest.spyOn(httpClient, 'get').mockImplementation(() => RESPONSE);

    expect(await loadLocale(LOCALE)).toMatchObject({
      locale: LOCALE,
      generateId: expect.anything(),
      missingTranslation: 'ignore',
      translations: { [LOCALE]: RESPONSE.data },
    });
  });
});

describe('File utils', () => {
  it('should get a unique name', () => {
    const uniqueName = getUniqueName(['test', 'test-1', 'test-2', 'test-3'], 'test');
    expect(uniqueName).toBe('test-4');
  });
});
