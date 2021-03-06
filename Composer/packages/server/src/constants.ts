// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QnABotTemplateId } from "@bfc/shared";

export const BASEURL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

export const QNA_SUBSCRIPTION_KEY = process.env.QNA_SUBSCRIPTION_KEY ?? '';

export const COGNITIVE_SERVICES_ENDPOINTS = 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0';

export const DOC_EXTENSIONS = ['.pdf', '.tsv', '.doc', '.docx', '.xlsx'];

export enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}

export const APPINSIGHTS_INSTRUMENTATIONKEY = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

export const piiProperties = ['projectId', 'rootProjectId'];

export const COMPOSER_VERSION = '1.3.1';

export const templateSortOrder = [{ generatorName: '@microsoft/generator-microsoft-bot-empty', displayName: 'Blank bot' }, { generatorName: '@microsoft/generator-microsoft-bot-conversational-core', displayName: 'Basic conversational bot' }, { generatorName: QnABotTemplateId, displayName: 'QnAMaker bot' }]