// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import axios, { CancelToken } from 'axios';
import formatMessage from 'format-message';
import { ExtensionSearchResult } from '@bfc/extension-client';

import httpClient from '../../../utils/httpUtil';

import { ExtensionSearchResults } from './ExtensionSearchResults';

type InstallExtensionDialogProps = {
  isOpen: boolean;
  onDismiss: () => void;
  onInstall: (selectedExtension: ExtensionSearchResult) => Promise<void>;
};

const InstallExtensionDialog: React.FC<InstallExtensionDialogProps> = (props) => {
  const { isOpen, onDismiss, onInstall } = props;
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<ExtensionSearchResult | null>(null);
  const [matchingExtensions, setMatchingExtensions] = useState<ExtensionSearchResult[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (query: string, cancelToken?: CancelToken) => {
    setIsSearching(true);
    httpClient
      .get(`/extensions/search?q=${query}`, { cancelToken })
      .then((res) => {
        setMatchingExtensions(res.data);
        setIsSearching(false);
      })
      .catch((err) => {
        setIsSearching(false);
        if (!axios.isCancel(err)) {
          // TODO: abrown - what to do on error?
          // eslint-disable-next-line no-console
          console.error(err);
        }
      });
  };

  useEffect(() => {
    performSearch('');
  }, []);

  useEffect(() => {
    if (searchQuery !== null) {
      const source = axios.CancelToken.source();

      const timer = setTimeout(() => {
        performSearch(searchQuery, source.token);
      }, 200);

      return () => {
        source.cancel('User interruption');
        clearTimeout(timer);
      };
    }
  }, [searchQuery]);

  const onSubmit = async () => {
    if (selectedExtension) {
      await onInstall(selectedExtension);
      performSearch(searchQuery ?? '');
    }
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: formatMessage('Add new extension'),
      }}
      hidden={!isOpen}
      minWidth="800px"
      onDismiss={onDismiss}
    >
      <div>
        <SearchBox
          placeholder={formatMessage('Search for extensions on npm')}
          value={searchQuery ?? ''}
          onChange={(_e, val) => setSearchQuery(val ?? null)}
        />
        <ExtensionSearchResults
          isSearching={isSearching}
          results={matchingExtensions}
          onSelect={(e) => setSelectedExtension(e)}
        />
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
        <PrimaryButton disabled={!selectedExtension} onClick={onSubmit}>
          {formatMessage('Add')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};

export { InstallExtensionDialog };
