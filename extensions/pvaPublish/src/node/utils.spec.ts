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
});
