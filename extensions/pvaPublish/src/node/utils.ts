// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { URL } from 'url';

import { logger } from './logger';
import { AUTH_CREDENTIALS } from './constants';
import { ClusterCategory } from './types';

/**
 * Looks at the cluster category for a request and returns the necessary authentication parameters
 * to get an access token for the resource.
 */
export const getAuthCredentials = (baseUrl = '', tenantId?: string, clusterCategory?: ClusterCategory) => {
  const host = new URL(baseUrl).host;
  clusterCategory = (process.env.COMPOSER_PVA_CLUSTER as ClusterCategory) ?? clusterCategory;
  if (
    ['Test', 'Preprod', 'Dev'].includes(clusterCategory) ||
    host.includes('.int.') ||
    host.includes('.ppe.') ||
    host.includes('.test.')
  ) {
    logger.log('Using INT / PPE auth credentials.');
    return AUTH_CREDENTIALS.INT;
  } else if (['Gov'].includes(clusterCategory) || host === 'gcc.api.powerva.microsoft.us') {
    logger.log('Using GCC auth credentials.');
    return AUTH_CREDENTIALS.GCC;
  } else if (['High'].includes(clusterCategory) || host === 'high.api.powerva.microsoft.us') {
    logger.log('Using GCC High auth credentials.');
    return {
      ...AUTH_CREDENTIALS.GCC_HIGH,
      authority: `https://login.microsoftonline.us/${tenantId}`,
    };
  }
  logger.log(`Using PROD auth credentials.\nCategory: ${clusterCategory}\nURL: ${baseUrl}`);
  // fall back to prod
  return AUTH_CREDENTIALS.PROD;
};
