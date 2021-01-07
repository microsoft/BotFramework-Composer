// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { stringify } from 'query-string';

import {
  AssetItem,
  AssetItemKind,
  BotBoundAssetData,
  DialogBoundAssetData,
  QuickCommandPredictionResult,
  SearchDocumentResult,
} from '../../components/Search/types';

export const documentationSearchUrl = 'https://composerdocsearch20210106.azurewebsites.net/search';

export const fetchCommands = async (query: string) => {
  const appId = '88a4d4fc-1e76-42ea-b8a5-7aa0459feea8';
  const predictionKey = '72b61027cb0945ed89e83dc6fa2cbd3c';
  const endpoint = 'https://mewapred1.cognitiveservices.azure.com/';

  const queryParams = {
    'show-all-intents': true,
    verbose: true,
    query,
    'subscription-key': predictionKey,
  };

  const requestUrl = `${endpoint}luis/prediction/v3.0/apps/${appId}/slots/production/predict?${stringify(queryParams)}`;

  const response = await fetch(requestUrl, { headers: { 'Content-Type': 'application/json' } });
  const { prediction } = (await response.json()) as QuickCommandPredictionResult;

  if (prediction?.topIntent === 'Commands') {
    return Object.keys(prediction.entities).filter((e) => e !== '$instance');
  }

  return [];
};

export const fetchDocumentations = async (query: string) => {
  const response = await fetch(`${documentationSearchUrl}?q=${query.replace(/ /g, '+')}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });

  return (await response.json()).Results as SearchDocumentResult[];
};

export const getAssetItemDeepLink = (item: AssetItem<BotBoundAssetData>) => {
  const { botId } = item.data;
  const baseLink = `/bot/${botId}`;
  switch (item.kind) {
    case 'formProperty':
      return '';
    case 'formDialog':
    case 'dialog':
      return `${baseLink}/dialogs/${item.id}`;
    case 'formSchema':
      return `${baseLink}/forms/${item.id}`;
    case 'lg': {
      const dialogId = (item.data as DialogBoundAssetData).dialogId;
      const itemId = item.id.startsWith(dialogId) ? dialogId : item.id;
      return `${baseLink}/language-generation/${itemId}`;
    }
    case 'lgImport': {
      const { dialogId } = item.data as DialogBoundAssetData;
      return `${baseLink}/language-generation/${dialogId}/item/${item.id}`;
    }
    case 'lu': {
      const dialogId = (item.data as DialogBoundAssetData).dialogId;
      const itemId = item.id.startsWith(dialogId) ? 'all' : item.id;
      return `${baseLink}/language-understanding/${itemId}`;
    }
    case 'luImport': {
      const { dialogId } = item.data as DialogBoundAssetData;
      return `${baseLink}/language-understanding/${dialogId}/item/${item.id}`;
    }
    case 'qna':
      return `${baseLink}/knowledge-base/${item.id}`;
    case 'trigger': {
      const dialogData = item.data as DialogBoundAssetData;
      return `${baseLink}/dialogs/${dialogData.dialogId}?selected=triggers["${item.id}"]`;
    }
  }
};

export const getAssetItemIcon = (kind: AssetItemKind) => {
  switch (kind) {
    case 'dialog':
      return 'Org';
    case 'formDialog':
      return 'Table';
    case 'formProperty':
      return '';
    case 'formSchema':
      return 'OfficeFormsLogo';
    case 'lg':
    case 'lgImport':
      return 'Robot';
    case 'lu':
    case 'luImport':
      return 'People';
    case 'qna':
      return 'Chat';
    case 'trigger':
      return 'LightningBolt';
  }
};
