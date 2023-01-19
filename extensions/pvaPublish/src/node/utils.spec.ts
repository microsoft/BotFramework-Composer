// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AUTH_CREDENTIALS, BASE_URLS } from './constants';
import { getAuthCredentials, getBaseUrl } from './utils';

describe('should return the proper PVA base URL for the environment', () => {
  let envBackup;
  beforeAll(() => {
    envBackup = { ...process.env };
  });

  beforeEach(() => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: '' });
  });

  afterAll(() => {
    Object.assign(process.env, envBackup); // restore the platform
  });

  it('fallback to prod', () => {
    expect(getBaseUrl()).toBe(BASE_URLS.PROD);
  });

  it('int', () => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: 'INT' });
    expect(getBaseUrl()).toBe(BASE_URLS.INT);
  });

  it('ppe', () => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: 'PPE' });
    expect(getBaseUrl()).toBe(BASE_URLS.PPE);
  });

  it('prod', () => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: 'PROD' });
    expect(getBaseUrl()).toBe(BASE_URLS.PROD);
  });

  it('gcc', () => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: 'GCC' });
    expect(getBaseUrl()).toBe(BASE_URLS.GCC);
  });

  it('gcc high', () => {
    Object.assign(process.env, { COMPOSER_PVA_PUBLISH_ENV: 'GCC-HIGH' });
    expect(getBaseUrl()).toBe(BASE_URLS.GCC_HIGH);
  });
});

describe('it should return the proper PVA auth parameters for the base URL', () => {
  it('fallback to prod', () => {
    let url: string | undefined = undefined;
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.PROD);

    url = 'https://dev.botframework.com/';
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.PROD);
  });

  it('int', () => {
    const url = 'https://bots.int.customercareintelligence.net/api/botmanagement/v1';
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.INT);
  });

  it('ppe', () => {
    const url = 'https://bots.ppe.customercareintelligence.net/api/botmanagement/v1';
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.PPE);
  });

  it('prod', () => {
    const url = 'https://powerva.microsoft.com/api/botmanagement/v1';
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.PROD);
  });

  it('gcc', () => {
    const url = 'https://gcc.api.powerva.microsoft.us/api/botmanagement/v1';
    expect(getAuthCredentials(url)).toEqual(AUTH_CREDENTIALS.GCC);
  });

  it('gcc high', () => {
    const url = 'https://high.api.powerva.microsoft.us/api/botmanagement/v1';
    const tenantId = '1234-6789-abcd-efgh';
    expect(getAuthCredentials(url, tenantId)).toEqual({
      ...AUTH_CREDENTIALS.GCC_HIGH,
      authority: `https://login.microsoftonline.us/${tenantId}`,
    });
  });
});
