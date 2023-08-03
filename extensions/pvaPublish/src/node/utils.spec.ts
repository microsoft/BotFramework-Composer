// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AUTH_CREDENTIALS } from './constants';
import { getAuthCredentials } from './utils';

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
