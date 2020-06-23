// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

import { Plugin } from '../../store/types';
import { useStoreContext } from '../../hooks';
import { IToolBarItem, ToolBar } from '../../components/ToolBar';

const PluginsPage: React.FC<RouteComponentProps> = () => {
  const {
    state: { plugins },
    actions: { fetchPlugins, togglePlugin, addPlugin },
  } = useStoreContext();
  const [showNewModal, setShowNewModal] = useState(false);
  const [pluginName, setPluginName] = useState<string | null>(null);
  const [pluginVersion, setPluginVersion] = useState<string | null>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const columns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: Plugin) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 30,
      maxWidth: 100,
      onRender: (item: Plugin) => {
        return <span>{item.version}</span>;
      },
    },
    {
      key: 'enabled',
      name: formatMessage('Enabled'),
      minWidth: 30,
      onRender: (item: Plugin) => {
        const text = item.enabled ? formatMessage('Disable') : formatMessage('Enable');
        return <DefaultButton onClick={() => togglePlugin(item.id, !item.enabled)}>{text}</DefaultButton>;
      },
    },
  ];

  const toolbarItems: IToolBarItem[] = [
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

  const submit = useCallback(() => {
    addPlugin(pluginName, pluginVersion);
    setShowNewModal(false);
    setPluginName(null);
    setPluginVersion(null);
  }, [pluginName, pluginVersion]);

  return (
    <div>
      <ToolBar toolbarItems={toolbarItems} />
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columns}
        items={plugins}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: formatMessage('Add new plugin'),
          subText: formatMessage('Search for plugins'),
        }}
        hidden={!showNewModal}
        onDismiss={() => setShowNewModal(false)}
      >
        <div>
          <TextField
            label={formatMessage('Plugin name')}
            value={pluginName ?? ''}
            onChange={(_e, val) => setPluginName(val ?? null)}
          />
          <TextField
            label={formatMessage('Plugin version')}
            placeholder="latest"
            value={pluginVersion ?? ''}
            onChange={(_e, val) => setPluginVersion(val ?? null)}
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

export default PluginsPage;
