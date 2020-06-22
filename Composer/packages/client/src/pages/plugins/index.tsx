// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';
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

import { Plugin } from '../../store/types';
import { useStoreContext } from '../../hooks';

const PluginsPage: React.FC<RouteComponentProps> = () => {
  const {
    state: { plugins },
    actions: { fetchPlugins, togglePlugin },
  } = useStoreContext();

  useEffect(() => {
    fetchPlugins();
  }, []);

  const columns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 30,
      maxWidth: 100,
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

  return (
    <div>
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columns}
        items={plugins}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
      />
    </div>
  );
};

export default PluginsPage;
