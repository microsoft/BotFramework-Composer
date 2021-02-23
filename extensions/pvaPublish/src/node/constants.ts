// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const COMPOSER_1P_APP_ID = 'ce48853e-0605-4f77-8746-d70ac63cc6bc';
export const API_VERSION = 'v1';

export const AUTH_CREDENTIALS = {
  INT: {
    // web auth flow
    clientId: COMPOSER_1P_APP_ID,
    scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe

    // electron auth flow
    targetResource: 'a522f059-bb65-47c0-8934-7db6e5286414',
  },
  PPE: {
    clientId: COMPOSER_1P_APP_ID,
    scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'],
    targetResource: 'a522f059-bb65-47c0-8934-7db6e5286414',
  },
  PROD: {
    clientId: COMPOSER_1P_APP_ID,
    scopes: ['96ff4394-9197-43aa-b393-6a41652e21f8/.default'],
    targetResource: '96ff4394-9197-43aa-b393-6a41652e21f8',
  },
};

export const BASE_URLS = {
  INT: `https://bots.int.customercareintelligence.net/`,
  PPE: `https://bots.ppe.customercareintelligence.net/`,
  PROD: `https://powerva.microsoft.com/`,
};
