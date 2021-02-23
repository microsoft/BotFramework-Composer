// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const AzureResourceTypes = {
  APP_REGISTRATION: 'appRegistration',
  BOT_REGISTRATION: 'botRegistration',
  WEBAPP: 'webApp',
  AZUREFUNCTIONS: 'azureFunctions',
  COSMOSDB: 'cosmosDb',
  APPINSIGHTS: 'applicationInsights',
  LUIS_AUTHORING: 'luisAuthoring',
  LUIS_PREDICTION: 'luisPrediction',
  BLOBSTORAGE: 'blobStorage',
  QNA: 'qna',
  SERVICE_PLAN: 'servicePlan',
};

const hostingGroupName = 'Azure Hosting';
const cognitiveServicesGroupName = 'Cognitive Services';

export const AzureResourceDefinitions = {
  [AzureResourceTypes.APP_REGISTRATION]: {
    description: 'Required registration allowing your bot to communicate with Azure services.',
    text: 'Microsoft Application Registration',
    tier: 'Free',
    group: hostingGroupName,
    key: AzureResourceTypes.APP_REGISTRATION,
  },
  [AzureResourceTypes.BOT_REGISTRATION]: {
    description:
      'Your own Bot hosted where you want, registered with the Azure Bot Service. Build, connect, and manage Bots to interact with your users wherever they are - from your app or website to Cortana, Skype, Messenger and many other services.',
    text: 'Microsoft Bot Channels Registration',
    tier: 'F0',
    group: hostingGroupName,
    key: AzureResourceTypes.BOT_REGISTRATION,
  },
  [AzureResourceTypes.WEBAPP]: {
    description:
      'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
    text: hostingGroupName,
    tier: 'S1 Standard',
    group: hostingGroupName,
    key: AzureResourceTypes.WEBAPP,
  },
  [AzureResourceTypes.AZUREFUNCTIONS]: {
    description: 'Azure Functions hosting your bot services.',
    text: 'Azure Functions',
    tier: 'S1 Standard',
    group: hostingGroupName,
    key: AzureResourceTypes.AZUREFUNCTIONS,
  },
  [AzureResourceTypes.COSMOSDB]: {
    description:
      'Azure Cosmos DB is a fully managed, globally-distributed, horizontally scalable in storage and throughput, multi-model database service backed up by comprehensive SLAs. It will be used for bot state retrieving.',
    text: 'Azure Cosmos DB',
    tier: 'Pay as you go',
    group: hostingGroupName,
    key: AzureResourceTypes.COSMOSDB,
  },
  [AzureResourceTypes.APPINSIGHTS]: {
    description:
      'Application performance, availability and usage information at your fingertips. Used for Bot chatting data analyzing.',
    text: 'Application Insights',
    tier: 'Pay as you go',
    group: hostingGroupName,
    key: AzureResourceTypes.APPINSIGHTS,
  },
  [AzureResourceTypes.LUIS_AUTHORING]: {
    description:
      'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis app authoring.',
    text: 'Microsoft Language Understanding Authoring Account',
    tier: 'F0',
    group: cognitiveServicesGroupName,
    key: AzureResourceTypes.LUIS_AUTHORING,
  },
  [AzureResourceTypes.LUIS_PREDICTION]: {
    description:
      'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis endpoint hitting.',
    text: 'Microsoft Language Understanding Prediction Account',
    tier: 'S0 Standard',
    group: cognitiveServicesGroupName,
    key: AzureResourceTypes.LUIS_PREDICTION,
  },
  [AzureResourceTypes.BLOBSTORAGE]: {
    description:
      'Microsoft Azure provides scalable, durable cloud storage, backup, and recovery solutions for any data, big or small. Used for bot transcripts logging.',
    text: 'Azure Blob Storage',
    tier: 'Standard_LRS',
    group: hostingGroupName,
    key: AzureResourceTypes.BLOBSTORAGE,
  },
  [AzureResourceTypes.QNA]: {
    description:
      'QnA Maker is a cloud-based API service that lets you create a conversational question-and-answer layer over your existing data. Use it to build a knowledge base by extracting questions and answers from your content, including FAQs, manuals, and documents. ',
    text: 'Microsoft QnA Maker',
    tier: 'S0 Standard',
    group: cognitiveServicesGroupName,
    key: AzureResourceTypes.QNA,
  },
  [AzureResourceTypes.SERVICE_PLAN]: {
    description:
      'App Service plans give you the flexibility to allocate specific apps to a given set of resources and further optimize your Azure resource utilization. This way, if you want to save money on your testing environment you can share a plan across multiple apps.',
    text: 'Microsoft App Service Plan',
    tier: 'S1 Standard',
    group: hostingGroupName,
    key: AzureResourceTypes.SERVICE_PLAN,
  },
};
