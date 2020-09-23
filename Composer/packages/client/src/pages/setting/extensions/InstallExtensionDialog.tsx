// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import axios from 'axios';
import formatMessage from 'format-message';

import httpClient from '../../../utils/httpUtil';

// TODO: extract to shared?
type ExtensionSearchResult = {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
};

type InstallExtensionDialogProps = {
  isOpen: boolean;
  onDismiss: () => void;
  onInstall: (selectedExtension: ExtensionSearchResult) => Promise<void>;
};

const InstallExtensionDialog: React.FC<InstallExtensionDialogProps> = (props) => {
  const { isOpen, onDismiss, onInstall } = props;
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [matchingExtensions, setMatchingExtensions] = useState<ExtensionSearchResult[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<ExtensionSearchResult | null>(null);

  useEffect(() => {
    if (searchQuery !== null) {
      const source = axios.CancelToken.source();

      const timer = setTimeout(() => {
        httpClient
          .get(`/extensions/search?q=${searchQuery}`, { cancelToken: source.token })
          .then((res) => {
            setMatchingExtensions(res.data);
          })
          .catch((err) => {
            if (!axios.isCancel(err)) {
              // TODO: abrown - what to do on error?
              // eslint-disable-next-line no-console
              console.error(err);
            }
          });
      }, 200);

      return () => {
        source.cancel('User interruption');
        clearTimeout(timer);
      };
    }
  }, [searchQuery]);

  const matchingColumns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ExtensionSearchResult) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      minWidth: 100,
      maxWidth: 300,
      isMultiline: true,
      onRender: (item: ExtensionSearchResult) => {
        return <div css={{ overflowWrap: 'break-word' }}>{item.description}</div>;
      },
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 30,
      maxWidth: 100,
      onRender: (item: ExtensionSearchResult) => {
        return <span>{item.version}</span>;
      },
    },
    {
      key: 'url',
      name: formatMessage('Url'),
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: ExtensionSearchResult) => {
        return item.url ? (
          <a href={item.url} rel="noopener noreferrer" target="_blank">
            View on npm
          </a>
        ) : null;
      },
    },
  ];

  const onSubmit = async () => {
    if (selectedExtension) {
      await onInstall(selectedExtension);
      setSearchQuery(null);
      setMatchingExtensions([]);
      setSelectedExtension(null);
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
        <TextField
          label={formatMessage('Search for extensions on npm')}
          value={searchQuery ?? ''}
          onChange={(_e, val) => setSearchQuery(val ?? null)}
        />
        {matchingExtensions.length > 0 && (
          <DetailsList
            checkboxVisibility={CheckboxVisibility.always}
            columns={matchingColumns}
            items={matchingExtensions}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            onActiveItemChanged={(item) => setSelectedExtension(item)}
          />
        )}
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
        <PrimaryButton disabled={false} onClick={onSubmit}>
          {formatMessage('Add')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};

export { InstallExtensionDialog };
