// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { ExtensionConfig } from '../../../recoilModel/types';
import { Toolbar, IToolbarItem } from '../../../components/Toolbar';
import { dispatcherState, extensionsState } from '../../../recoilModel';

import { InstallExtensionDialog } from './InstallExtensionDialog';

const Extensions: React.FC<RouteComponentProps> = () => {
  const { fetchExtensions, toggleExtension, addExtension, removeExtension } = useRecoilValue(dispatcherState);
  const extensions = useRecoilValue(extensionsState);
  const [showNewModal, setShowNewModal] = useState(false);

  const remoteExtensions = useMemo(() => extensions.filter((e) => !e.builtIn), [extensions]);

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
      await addExtension(selectedExtension.id);
      setShowNewModal(false);
    }
  };

  return (
    <div>
      <Toolbar toolbarItems={toolbarItems} />
      {/* only show when extensions are installed */}
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={installedColumns}
        items={remoteExtensions}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
      />
      <InstallExtensionDialog isOpen={showNewModal} onDismiss={() => setShowNewModal(false)} onInstall={submit} />
    </div>
  );
};

export { Extensions };
