// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { useRecoilValue, selector } from 'recoil';

import { ExtensionConfig } from '../../../recoilModel/types';
import { Toolbar, IToolbarItem } from '../../../components/Toolbar';
import { dispatcherState, extensionsState } from '../../../recoilModel';

import { InstallExtensionDialog } from './InstallExtensionDialog';

const remoteExtensionsState = selector({
  key: 'remoteExtensions',
  get: ({ get }) => get(extensionsState).filter((e) => !e.builtIn),
});

const Extensions: React.FC<RouteComponentProps> = () => {
  const { fetchExtensions, toggleExtension, addExtension, removeExtension } = useRecoilValue(dispatcherState);
  const extensions = useRecoilValue(remoteExtensionsState);
  const [isAdding, setIsAdding] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    fetchExtensions();
  }, []);

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

  const toolbarItems: IToolbarItem[] = [
    {
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
    },
  ];

  const submit = async (selectedExtension) => {
    if (selectedExtension) {
      setIsAdding(true);
      setShowNewModal(false);
      await addExtension(selectedExtension.id);
      setIsAdding(false);
    }
  };

  return (
    <div>
      <Toolbar toolbarItems={toolbarItems} />
      {(isAdding || extensions.length > 0) && (
        <ShimmeredDetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={installedColumns}
          items={isAdding ? [...extensions, null] : extensions}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          shimmerLines={1}
        />
      )}
      <InstallExtensionDialog isOpen={showNewModal} onDismiss={() => setShowNewModal(false)} onInstall={submit} />
    </div>
  );
};

export { Extensions };
