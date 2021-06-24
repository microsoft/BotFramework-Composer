// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResourceDefinition } from '../types';

export const AZURE_HOSTING_GROUP_NAME = 'App Services';
export const COGNITIVE_SERVICES_GROUP_NAME = 'Cognitive Services';
// export type HostingGroupName = 'Azure Hosting' | 'Cognitive Services';

export const webAppResourceDefinition: ResourceDefinition = {
  key: 'webApp',
  description:
    'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
  text: 'App Services',
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const appInsightsDefinition: ResourceDefinition = {
  key: 'appInsights',
  description: 'Application Insights allows you to monitor and analyze usage and performance of your bot.',
  text: 'Application Insights',
  tier: 'Pay as you go',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const appRegistrationDefinition: ResourceDefinition = {
  key: 'appRegistration',
  text: 'Microsoft Application Registration',
  description: 'Required registration allowing your bot to communicate with Azure services.',
  tier: 'Free',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const azureFunctionDefinition: ResourceDefinition = {
  key: 'azureFunctions',
  description: 'Azure Functions hosting your bot services.',
  text: 'Azure Functions',
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const blobStorageDefinition: ResourceDefinition = {
  key: 'blobStorage',
  description:
    'Azure blob storage provides scalable cloud storage, backup and recovery solutions for any data, including bot transcript logs.',
  text: 'Azure Blob Storage',
  tier: 'Standard_LRS',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const botRegistrationDefinition: ResourceDefinition = {
  key: 'botRegistration',
  text: 'Microsoft Bot Channels Registration',
  description:
    'When registered with the Azure Bot Service, you can host your bot in any environment and enable customers from a variety of channels, such as your app or website, Direct Line Speech, Microsoft Teams and more.',
  tier: 'F0',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const cosmosDbDefinition: ResourceDefinition = {
  key: 'cosmosDb',
  description:
    'Azure Cosmos DB is a fully managed, globally-distributed, horizontally scalable in storage and throughput, multi-model database service backed up by comprehensive SLAs. It will be used for bot state retrieving.',
  text: 'Azure Cosmos DB',
  tier: 'Pay as you go',
  group: AZURE_HOSTING_GROUP_NAME,
};
export const luisAuthoringDefinition: ResourceDefinition = {
  key: 'luisAuthoring',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis app authoring.',
  text: 'Microsoft Language Understanding Authoring Account',
  tier: 'F0',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};
export const luisPredictionDefinition: ResourceDefinition = {
  key: 'luisPrediction',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis endpoint hitting.',
  text: 'Microsoft Language Understanding Prediction Account',
  tier: 'S0 Standard',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};
export const qnaDefinition: ResourceDefinition = {
  key: 'qna',
  description:
    'QnA Maker is a cloud-based API service that lets you create a conversational question-and-answer layer over your existing data. Use it to build a knowledge base by extracting questions and answers from your content, including FAQs, manuals, and documents.',
  text: 'Microsoft QnA Maker',
  tier: 'S0 Standard',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};
export const servicePlanDefinition = {
  key: 'servicePlan',
  description:
    'App Service plans give you the flexibility to allocate specific apps to a given set of resources and further optimize your Azure resource utilization. This way, if you want to save money on your testing environment you can share a plan across multiple apps.',
  text: 'Microsoft App Service Plan',
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};
