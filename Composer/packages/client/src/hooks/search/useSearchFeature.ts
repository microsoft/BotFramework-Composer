// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Fuse from 'fuse.js';
import startCase from 'lodash/startCase';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import {
  AssetItem,
  QuickCommandType,
  SearchDocumentResult,
  SearchKind,
  SearchResult,
} from '../../components/Search/types';
import { rootBotProjectIdSelector } from '../../recoilModel';
import { useProjectAssetItems } from '../useProjectAssetItems';

import { fetchCommands, fetchDocumentations, getAssetItemDeepLink, getAssetItemIcon, getCommandLink } from './utils';

export const useSearchFeature = (query: string, minCharCountRequirement = 3) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector) || '';
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

  const searchCommands = async (query: string, update = false) => {
    const commands = await fetchCommands(query);
    const results = commands.map<SearchResult<{ label: string }>>((command) => ({
      id: command,
      kind: 'command',
      linkUrl: getCommandLink(rootBotId, command as QuickCommandType),
      icon: 'ChevronRight',
      data: {
        label: startCase(command)
          .split(' ')
          .map((c, i) => (i === 0 ? c : c.toLocaleLowerCase()))
          .join(' '),
      },
    }));

    if (update) {
      setSearching(false);
      setItems(results);
    }

    return results;
  };

  const searchAssets = async (query: string, update = false) => {
    const assets = fuse.search(query);
    const results = assets.map<SearchResult<Fuse.FuseResult<AssetItem<any>>>>((asset) => ({
      id: asset.item.id,
      data: asset,
      kind: 'asset',
      linkUrl: getAssetItemDeepLink(asset.item),
      icon: getAssetItemIcon(asset.item.kind),
    }));

    if (update) {
      setSearching(false);
      setItems(results);
    }

    return results;
  };

  const searchDocumentations = async (query: string, update = false) => {
    const documentations = await fetchDocumentations(query);
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
