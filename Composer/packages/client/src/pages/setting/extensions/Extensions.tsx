// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
  ConstrainMode,
  DetailsRow,
  IDetailsRowStyles,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import formatMessage from 'format-message';
import { useRecoilValue, selector } from 'recoil';
import { NeutralColors } from '@uifabric/fluent-theme';
import { ExtensionMetadata, ExtensionSearchResult } from '@bfc/extension-client';

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
  const [selectedExtensions, setSelectedExtensions] = useState<ExtensionMetadata[]>([]);
  const selection = useRef(
    new Selection({
      onSelectionChanged: () => {
        setSelectedExtensions(selection.getSelection() as ExtensionMetadata[]);
      },
    })
  ).current;

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
      onRender: (item: ExtensionMetadata) => {
        return (
          <Toggle
            ariaLabel={formatMessage('Toggle extension')}
            checked={item.enabled}
            styles={{ root: { marginBottom: 0 } }}
            onChange={async () => {
              const timeout = setTimeout(() => setIsUpdating(item.id), 200);
              await toggleExtension(item.id, !item.enabled);
              clearTimeout(timeout);
              setIsUpdating(false);
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
    {
      type: 'action',
      text: formatMessage('Uninstall'),
      buttonProps: {
        iconProps: {
          iconName: 'Trash',
        },
        onClick: async () => {
          const names = selectedExtensions.map((e) => e.name).join('\n');
          const message = formatMessage('Are you sure you want to uninstall these extensions?');
          if (confirm(`${message}\n\n${names}`)) {
            for (const ext of selectedExtensions) {
              const timeout = setTimeout(() => setIsUpdating(ext.id), 200);
              await removeExtension(ext.id);
              clearTimeout(timeout);
              setIsUpdating(false);
            }
          }
        },
      },
      disabled: selectedExtensions.length === 0,
      align: 'left',
    },
  ];

  const submit = useCallback(async (selectedExtension?: ExtensionSearchResult) => {
    if (selectedExtension) {
      setIsUpdating(true);
      setShowNewModal(false);
      await addExtension(selectedExtension.id);
      setIsUpdating(false);
    }
  }, []);

  const shownItems = () => {
    if (isUpdating === true) {
      // extension is being added, render a shimmer row at end of list
      return [...extensions, null];
    } else if (typeof isUpdating === 'string') {
      // extension is being removed or updated, show shimmer for that row
      return extensions.map((e) => (e.id === isUpdating ? null : e));
    } else if (extensions.length === 0) {
      // render no installed message
      return [{}];
    } else {
      return extensions;
    }
  };

  const dismissInstallDialog = useCallback(() => setShowNewModal(false), []);

  return (
    <div style={{ maxWidth: '100%' }}>
      <Toolbar toolbarItems={toolbarItems} />
      <ShimmeredDetailsList
        checkboxVisibility={CheckboxVisibility.onHover}
        columns={installedColumns}
        constrainMode={ConstrainMode.horizontalConstrained}
        items={shownItems()}
        layoutMode={DetailsListLayoutMode.justified}
        selection={selection}
        selectionMode={SelectionMode.multiple}
        onRenderRow={(rowProps, defaultRender) => {
          if (rowProps && defaultRender) {
            if (isUpdating) {
              return defaultRender(rowProps);
            }

            if (extensions.length === 0) {
              return (
                <div css={noExtensionsStyles}>
                  <p>{formatMessage('No extensions installed')}</p>
                </div>
              );
            }

            const customStyles: Partial<IDetailsRowStyles> = {
              root: {
                color: rowProps.item?.enabled ? undefined : NeutralColors.gray90,
              },
            };

            return <DetailsRow {...rowProps} styles={customStyles} />;
          }

          return null;
        }}
      />
      <InstallExtensionDialog isOpen={showNewModal} onDismiss={dismissInstallDialog} onInstall={submit} />
    </div>
  );
};

export { Extensions };
