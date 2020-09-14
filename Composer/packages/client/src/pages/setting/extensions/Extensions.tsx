// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import axios from 'axios';
import { useRecoilValue } from 'recoil';

import { ExtensionConfig } from '../../../recoilModel/types';
import { Toolbar, IToolbarItem } from '../../../components/Toolbar';
import httpClient from '../../../utils/httpUtil';
import { dispatcherState, extensionsState } from '../../../recoilModel';

const Extensions: React.FC<RouteComponentProps> = () => {
  const { fetchExtensions, toggleExtension, addExtension, removeExtension } = useRecoilValue(dispatcherState);
  const extensions = useRecoilValue(extensionsState);
  const [showNewModal, setShowNewModal] = useState(false);
  const [extensionName, setExtensionName] = useState<string | null>(null);
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);
  const [matchingExtensions, setMatchingExtensions] = useState<ExtensionConfig[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<any>();

  useEffect(() => {
    fetchExtensions();
  }, []);

  useEffect(() => {
    if (extensionName !== null) {
      const source = axios.CancelToken.source();

      const timer = setTimeout(() => {
        httpClient
          .get(`/extensions/search?q=${extensionName}`, { cancelToken: source.token })
          .then((res) => {
            setMatchingExtensions(res.data);
          })
          .catch((err) => {
            if (!axios.isCancel(err)) {
              console.error(err);
            }
          });
      }, 200);

      return () => {
        source.cancel('User interruption');
        clearTimeout(timer);
      };
    }
  }, [extensionName]);

  const installedColumns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ExtensionConfig) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 30,
      maxWidth: 100,
      onRender: (item: ExtensionConfig) => {
        return <span>{item.version}</span>;
      },
    },
    {
      key: 'enabled',
      name: formatMessage('Enabled'),
      minWidth: 30,
      maxWidth: 150,
      onRender: (item: ExtensionConfig) => {
        const text = item.enabled ? formatMessage('Disable') : formatMessage('Enable');
        return (
          <DefaultButton disabled={item.builtIn} onClick={() => toggleExtension(item.id, !item.enabled)}>
            {text}
          </DefaultButton>
        );
      },
    },
    {
      key: 'remove',
      name: formatMessage('Remove'),
      minWidth: 30,
      maxWidth: 150,
      onRender: (item: ExtensionConfig) => {
        return (
          <DefaultButton disabled={item.builtIn} onClick={() => removeExtension(item.id)}>
            {formatMessage('Remove')}
          </DefaultButton>
        );
      },
    },
  ];

  const matchingColumns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: any) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      minWidth: 100,
      maxWidth: 300,
      isMultiline: true,
      onRender: (item: any) => {
        return <div css={{ overflowWrap: 'break-word' }}>{item.description}</div>;
      },
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 30,
      maxWidth: 100,
      onRender: (item: any) => {
        return <span>{item.version}</span>;
      },
    },
    {
      key: 'url',
      name: formatMessage('Url'),
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: any) => {
        return item.url ? (
          <a href={item.url} rel="noopener noreferrer" target="_blank">
            View on npm
          </a>
        ) : null;
      },
    },
  ];

  const toolbarItems: IToolbarItem[] = [
    // TODO (toanzian / abrown): re-enable once remote extensions are supported
    /*{
      type: 'action',
      text: formatMessage('Add'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {
          setShowNewModal(true);
        },
      },
      align: 'left',
    },*/
  ];

  const submit = useCallback(() => {
    if (selectedExtension && extensionVersion) {
      addExtension(selectedExtension.id, extensionVersion);
      setShowNewModal(false);
      setExtensionName(null);
      setExtensionVersion(null);
      setSelectedExtension(null);
    }
  }, [selectedExtension, extensionVersion]);

  return (
    <div>
      <Toolbar toolbarItems={toolbarItems} />
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={installedColumns}
        items={extensions}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.close,
          title: formatMessage('Add new extension'),
          subText: formatMessage('Search for extensions'),
        }}
        hidden={!showNewModal}
        minWidth="600px"
        onDismiss={() => setShowNewModal(false)}
      >
        <div>
          <TextField
            label={formatMessage('Extension name')}
            value={extensionName ?? ''}
            onChange={(_e, val) => setExtensionName(val ?? null)}
          />
          <DetailsList
            checkboxVisibility={CheckboxVisibility.always}
            columns={matchingColumns}
            items={matchingExtensions}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            onActiveItemChanged={(item) => setSelectedExtension(item)}
          />
        </div>
        <DialogFooter>
          <DefaultButton onClick={() => setShowNewModal(false)}>Cancel</DefaultButton>
          <PrimaryButton disabled={false} onClick={submit}>
            {formatMessage('Add')}
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export { Extensions };
