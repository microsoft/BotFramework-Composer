// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

export const authConfig = {
  arm: {
    // for web login
    scopes: ['https://management.core.windows.net/user_impersonation'],
    // for electron
    targetResource: 'https://management.core.windows.net/',
  },
  graph: {
    // for web login
    scopes: ['https://graph.microsoft.com/Application.ReadWrite.All'],
    // for electron
    targetResource: 'https://graph.microsoft.com/',
  },
};

export const getTenantId = async (accessToken: string, subId: string) => {
  if (!accessToken) {
    throw new Error(
      'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
    );
  }
  if (!subId) {
    throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
  }
  try {
    const tenantUrl = `https://management.azure.com/subscriptions/${subId}?api-version=2020-01-01`;
    const options = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };
    const response = await axios.get<string>(tenantUrl, options);
    const jsonRes = JSON.parse(response.data);
    if (jsonRes.tenantId === undefined) {
      throw new Error(`No tenants found in the account.`);
    }
    return jsonRes.tenantId;
  } catch (err) {
    throw new Error(`Get Tenant Id Failed`);
  }
};
