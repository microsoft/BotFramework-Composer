// https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions
export const LuisAuthoringSupportLocation = ['westus', 'australiaeast', 'westeurope'];
export const LuisPublishSupportLocation = {
  'australiaeast': [
    'australiaeast'
  ],
  'westeurope': [
    'francecentral',
    'northeurope',
    'westeurope',
    'uksouth',
  ],
  'westus':[
    'southafricanorth',
    'centralindia',
    'eastasia',
    'japaneast',
    'japanwest',
    'koreacentral',
    'southeastasia',
    'canadacentral',
    'centralus',
    'eastus',
    'eastus2',
    'northcentralus',
    'southcentralus',
    'westcentralus',
    'westus',
    'westus2',
    'brazilsouth'
  ]
};

export enum AzureAPIStatus {
  INFO = 'INFO',
  PARAM_ERROR = 'PARAM_ERROR',
  ERROR = 'ERROR',
}

export enum AzureResourceProviderType {
  QnA = 'Microsoft.CognitiveServices',
  Luis = 'Microsoft.CognitiveServices',
  CosmosDB = 'Microsoft.DocumentDB',
  BlobStorage = 'Microsoft.Storage',
  ApplicationInsights = 'Microsoft.Insights',
  WebApp = 'Microsoft.Web',
  Bot = 'Microsoft.BotService',
}

export type ResourcesItem = {
  description: string,
  text: string,
  tier: string,
  group: string,
  key: string,
  required: boolean,
  [key:string]: any,
}