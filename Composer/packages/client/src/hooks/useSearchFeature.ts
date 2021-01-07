// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { stringify } from 'query-string';

import {
  AssetItem,
  AssetItemKind,
  BotBoundAssetData,
  DialogBoundAssetData,
  QuickCommandPredictionResult,
  SearchDocumentResult,
  SearchKind,
  SearchResult,
} from '../components/Search/types';

import { useProjectAssetItems } from './useProjectAssetItems';

const documentationSearchUrl = 'https://composerdocsearch20210106.azurewebsites.net/search';

const getLuisPrediction = async (query: string) => {
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

  return (await response.json()) as QuickCommandPredictionResult;
};

const getDeepLink = (item: AssetItem<BotBoundAssetData>) => {
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

const getAssetItemIcon = (kind: AssetItemKind) => {
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

export const useSearchFeature = (query: string, minCharCountRequirement = 3) => {
  const [items, setItems] = useState<SearchResult<any>[]>([]);
  const { 0: isSearching, 1: setSearching } = useState(false);
  const assetItems = useProjectAssetItems<any>();

  const fuse = useMemo(
    () =>
      new Fuse(assetItems, {
        includeScore: true,
        includeMatches: true,
        isCaseSensitive: false,
        useExtendedSearch: true,
        findAllMatches: true,
        keys: ['data.label', 'path'],
      }),
    [assetItems]
  );

  const searchCommands = async (_query: string, _update = false) => {
    console.log(getLuisPrediction);
    return [];
  };

  const searchAssets = async (query: string, update = false) => {
    const assets = fuse.search(query);
    const results = assets.map<SearchResult<Fuse.FuseResult<AssetItem<any>>>>((asset) => ({
      id: asset.item.id,
      data: asset,
      kind: 'asset',
      linkUrl: getDeepLink(asset.item),
      icon: getAssetItemIcon(asset.item.kind),
    }));

    if (update) {
      setSearching(false);
      setItems(results);
    }

    return results;
  };

  const searchDocumentations = async (query: string, update = false) => {
    const response = await fetch(`${documentationSearchUrl}?q=${query.replace(/ /g, '+')}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    });

    const documentations = (await response.json()).Results as SearchDocumentResult[];
    const results = documentations.map<SearchResult<SearchDocumentResult>>((d) => ({
      id: d.Title,
      kind: 'documentation',
      data: d,
      linkUrl: d.Url,
      icon: 'Documentation',
    }));
    if (update) {
      setSearching(false);
      setItems(results);
    }
    return results;
  };

  const searchAll = async (query: string) => {
    const [assets, documentations, commands] = await Promise.all([
      searchAssets(query),
      searchDocumentations(query),
      searchCommands(query),
    ]);

    setSearching(false);
    setItems([...assets, ...documentations, ...commands]);
  };

  const search = (query: string, kind: SearchKind = 'all') => {
    switch (kind) {
      case 'all':
        searchAll(query);
        break;
      case 'asset':
        searchAssets(query, true);
        break;
      case 'command':
        searchCommands(query, true);
        break;
      case 'documentation':
        searchDocumentations(query, true);
        break;
    }
  };

  const clear = () => {
    setItems([]);
  };

  useEffect(() => {
    clear();
    if (query && query.length >= minCharCountRequirement) {
      setSearching(true);
      const kindChar = query.slice(0, 1);
      if (['?', '/', '>'].includes(kindChar)) {
        const textQuery = query.slice(1).trim();
        if (textQuery) {
          switch (kindChar) {
            case '?':
              search(textQuery, 'documentation');
              break;
            case '/':
              search(textQuery, 'asset');
              break;
            case '>':
              search(textQuery, 'command');
              break;
          }
        }
      } else {
        search(query, 'all');
      }
    } else {
      setSearching(false);
      if (items.length) {
        clear();
      }
    }
  }, [query, minCharCountRequirement]);

  return { items, clear, isSearching };
};
