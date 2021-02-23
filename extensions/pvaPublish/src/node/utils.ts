// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { URL } from 'url';

import { logger } from './logger';
import { AUTH_CREDENTIALS, BASE_URLS } from './constants';

export const getBaseUrl = () => {
  logger.log('Base URL not supplied in publishing target. Falling back to hardcoded URL...');
  const pvaEnv = (process.env.COMPOSER_PVA_PUBLISH_ENV || '').toLowerCase();
  switch (pvaEnv) {
    case 'prod': {
      const url = BASE_URLS.PROD;
      logger.log('prod pva publish detected, operation using PVA url: ', url);
      return url;
    }

    case 'ppe': {
      const url = BASE_URLS.PPE;
      logger.log('ppe pva publish detected, operation using PVA url: ', url);
      return url;
    }

    case 'int': {
      const url = BASE_URLS.INT;
      logger.log('int pva publish env detected, operation using PVA url: ', url);
      return url;
    }

    default: {
      const url = BASE_URLS.PROD;
      logger.log('No pva publish env detected, operation using PVA url: ', url);
      return url;
    }
  }
};

/**
 * Looks at the base URL for a request and returns the necessary authentication parameters
 * to get an access token for the resource.
 */
export const getAuthCredentials = (baseUrl = '') => {
  if (baseUrl) {
    const host = new URL(baseUrl).host;

    if (host === 'bots.int.customercareintelligence.net') {
      return AUTH_CREDENTIALS.INT;
    }
    if (host === 'bots.ppe.customercareintelligence.net') {
      return AUTH_CREDENTIALS.PPE;
    }
  }
  // fall back to prod
  return AUTH_CREDENTIALS.PROD;
};
