// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate } from '../../types/lib';

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

export const FallbackTemplateFeedObj: BotTemplate[] = [
  {
    id: '@microsoft/generator-bot-enterprise-calendar',
    name: '@microsoft/generator Bot Enterprise Calendar',
    description:
      'Yeoman generator for creating an Adaptive bot built on the Azure Bot Framework using the Calendar template.',
    package: {
      packageName: '@microsoft/generator-bot-enterprise-calendar',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: false,
  },
  {
    id: '@microsoft/generator-bot-empty',
    name: '@microsoft/generator Bot Empty',
    description: 'Yeoman generator for creating an empty bot built on the Azure Bot Framework.',
    package: {
      packageName: '@microsoft/generator-bot-empty',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    nodeSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: false,
  },
  {
    id: '@microsoft/generator-bot-enterprise-people',
    name: '@microsoft/generator Bot Enterprise People',
    description:
      'Yeoman generator for creating an Adaptive bot built on the Azure Bot Framework using the People template.',
    package: {
      packageName: '@microsoft/generator-bot-enterprise-people',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: false,
  },
  {
    id: '@microsoft/generator-bot-core-language',
    name: '@microsoft/generator Bot Core Language',
    description: 'Yeoman generator for creating a simple conversational bot with NLP built on the Azure Bot Framework.',
    package: {
      packageName: '@microsoft/generator-bot-core-language',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    nodeSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: false,
  },
  {
    id: '@microsoft/generator-bot-core-assistant',
    name: '@microsoft/generator Bot Core Assistant',
    description: 'Yeoman generator for creating an assistant-style bot with NLP built on the Azure Bot Framework.',
    package: {
      packageName: '@microsoft/generator-bot-core-assistant',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: false,
  },
  {
    id: '@microsoft/generator-bot-enterprise-assistant',
    name: '@microsoft/generator Bot Enterprise Assistant',
    description:
      'Yeoman generator for creating an enterprise assistant, with a root bot and two skills built on the Azure Bot Framework.',
    package: {
      packageName: '@microsoft/generator-bot-enterprise-assistant',
      packageSource: 'npm',
      packageVersion: '1.1.2',
      availableVersions: [],
    },
    dotnetSupport: { functionsSupported: true, webAppSupported: true },
    isMultiBotTemplate: true,
  },
];
