// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
  ConstrainMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
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

const noExtensionsStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Extensions: React.FC<RouteComponentProps> = () => {
  const { fetchExtensions, toggleExtension, addExtension, removeExtension } = useRecoilValue(dispatcherState);
  const extensions = useRecoilValue(remoteExtensionsState);
  // if a string, its the id of the extension being updated
  const [isUpdating, setIsUpdating] = useState<string | boolean>(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    fetchExtensions();
  }, []);

  const installedColumns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 250,
      isResizable: true,
      isRowHeader: true,
      fieldName: 'name',
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      minWidth: 150,
      maxWidth: 500,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      fieldName: 'description',
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 100,
      maxWidth: 100,
      isResizable: true,
      fieldName: 'version',
    },
    {
      key: 'enabled',
      name: formatMessage('Enabled'),
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: ExtensionConfig) => {
        return (
          <Toggle
            ariaLabel={formatMessage('Toggle extension')}
            checked={item.enabled}
            onChange={() => toggleExtension(item.id, !item.enabled)}
          />
        );
      },
    },
    {
      key: 'remove',
      name: formatMessage('Remove'),
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: ExtensionConfig) => {
        return (
          <IconButton
            ariaLabel={formatMessage('Uninstall {extension}', { extension: item.name })}
            disabled={item.builtIn}
            iconProps={{ iconName: 'Trash' }}
            onClick={async () => {
              if (confirm(formatMessage('Are you sure you want to uninstall {extension}?', { extension: item.name }))) {
                setIsUpdating(item.id);
                await removeExtension(item.id);
                setIsUpdating(false);
              }
            }}
          />
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
      setIsUpdating(true);
      setShowNewModal(false);
      await addExtension(selectedExtension.id);
      setIsUpdating(false);
    }
  };

  const shownItems = () => {
    if (extensions.length === 0) {
      // render no installed message
      return [{}];
    } else if (isUpdating === true) {
      // extension is being added, render a shimmer row at end of list
      return [...extensions, null];
    } else if (typeof isUpdating === 'string') {
      // extension is being removed or updated, show shimmer for that row
      return extensions.map((e) => (e.id === isUpdating ? null : e));
    } else {
      return extensions;
    }
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <Toolbar toolbarItems={toolbarItems} />
      <ShimmeredDetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={installedColumns}
        constrainMode={ConstrainMode.horizontalConstrained}
        items={shownItems()}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        onRenderRow={(rowProps, defaultRender) => {
          if (extensions.length === 0) {
            return (
              <div css={noExtensionsStyles}>
                <p>No extensions installed</p>
              </div>
            );
          }

          if (defaultRender) {
            return defaultRender(rowProps);
          }

          return null;
        }}
      />
      <InstallExtensionDialog isOpen={showNewModal} onDismiss={() => setShowNewModal(false)} onInstall={submit} />
    </div>
  );
};

export { Extensions };
