// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const BASEURL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

export const QNA_SUBSCRIPTION_KEY = process.env.QNA_SUBSCRIPTION_KEY ?? '';

export const COGNITIVE_SERVICES_ENDPOINTS = 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0';

export const DOC_EXTENSIONS = ['.pdf', '.tsv', '.doc', '.docx', '.xlsx'];

export enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}
