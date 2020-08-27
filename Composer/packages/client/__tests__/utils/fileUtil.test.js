// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { getExtension, getBaseName, upperCaseName, loadLocale } from '../../src/utils/fileUtil';
import httpClient from '../../src/utils/httpUtil';

jest.mock('../../src/utils/httpUtil');
jest.mock('format-message');

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

describe.only('loadLocale', () => {
  it("does not set locale if it can't find one", () => {
    jest.spyOn(httpClient, 'get').mockImplementation(() => ({ data: null }));

    loadLocale('en-DoesNotExist');
    expect(formatMessage.setup).not.toHaveBeenCalled();
  });
  it('does not set locale if the server returns an error page', () => {
    jest.spyOn(httpClient, 'get').mockImplementation(() => ({ data: 'error page' }));

    loadLocale('en-test');
    expect(formatMessage.setup).not.toHaveBeenCalled();
  });
  it('sets locale if it does find one', () => {
    const RESPONSE = { data: { abc: 'def' } };
    const LOCALE = 'en-test';

    jest.spyOn(httpClient, 'get').mockImplementation(() => RESPONSE);

    loadLocale(LOCALE);
    expect(formatMessage.setup).toHaveBeenCalledWith({
      locale: LOCALE,
      generateId: expect.anything(),
      missingTranslation: 'ignore',
      translations: { [LOCALE]: RESPONSE.data },
    });
  });
});
