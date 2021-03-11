// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  PrimaryButton,
  DialogFooter,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  Icon,
  IconButton,
  ActionButton,
  TextField,
} from 'office-ui-fabric-react';
import { useState, useEffect, Fragment } from 'react';
import { useApplicationApi, useTelemetryClient, TelemetryClient } from '@bfc/extension-client';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { v4 as uuid } from 'uuid';

import { PackageSourceFeed } from '../pages/Library';

interface DisplayFieldProps {
  text: string;
  readonly?: boolean;
}
const DisplayField: React.FC<DisplayFieldProps> = (props) => {
  return (
    <div style={{ paddingTop: 7, paddingBottom: 9 }}>
      {props.text} {props.readonly && <Icon iconName="lock" />}
    </div>
  );
};

export interface WorkingModalProps {
  hidden: boolean;
  feeds: PackageSourceFeed[];
  closeDialog: any;
  onUpdateFeed: any;
}
export const FeedModal: React.FC<WorkingModalProps> = (props) => {
  const [selectedItem, setSelectedItem] = useState<PackageSourceFeed | undefined>(undefined);
  const [items, setItems] = useState<PackageSourceFeed[]>(props.feeds);
  const [editRow, setEditRow] = useState<boolean>(false);
  const { confirm } = useApplicationApi();
  const telemetryClient: TelemetryClient = useTelemetryClient();

  const uitext = {
    title: formatMessage('Edit feeds'),
    subTitle: formatMessage('Manage the package sources'),
  };

  const [selection, setSelection] = useState<Selection>(
    new Selection({
      onSelectionChanged: () => {
        setEditRow(false);
        if (selection.getSelectedCount() > 0) {
          setSelectedItem(selection.getSelection()[0] as PackageSourceFeed);
          setEditRow(true);
        } else {
          setSelectedItem(undefined);
        }
      },
    })
  );

  useEffect(() => {
    setItems(props.feeds);
    selection.toggleAllSelected();
    setSelectedItem(undefined);
    setEditRow(false);
  }, [props.feeds, props.hidden]);

  const columns = [
    {
      key: 'column1',
      name: 'Name',
      fieldName: 'text',
      minWidth: 150,
      maxWidth: 150,
      height: 32,
      isResizable: false,
      onRender: (item: PackageSourceFeed) => {
        if (!selectedItem || item.key !== selectedItem.key || !editRow)
          return <DisplayField readonly={item.readonly} text={item.text} />;
        return (
          <TextField
            disabled={!selectedItem || selectedItem.readonly}
            placeholder={formatMessage('Feed Name')}
            styles={{ field: { fontSize: 12 } }}
            value={selectedItem?.text}
            onChange={updateSelected('text')}
          />
        );
      },
    },
    {
      key: 'column2',
      name: 'URL',
      fieldName: 'url',
      minWidth: 300,
      isResizable: false,
      height: 32,
      onRender: (item: PackageSourceFeed) => {
        if (!selectedItem || item.key !== selectedItem.key || !editRow) return <DisplayField text={item.url} />;
        return (
          <TextField
            disabled={!selectedItem || selectedItem.readonly}
            placeholder={formatMessage('URL')}
            styles={{ field: { fontSize: 12 } }}
            value={selectedItem ? selectedItem.url : ''}
            onChange={updateSelected('url')}
          />
        );
      },
    },
    {
      key: 'column3',
      minWidth: 40,
      maxWidth: 40,
      isResizable: false,
      name: '',
      onRender: (item: PackageSourceFeed) => {
        if (selectedItem && item.key === selectedItem.key)
          return (
            <Fragment>
              <IconButton
                disabled={!selectedItem || selectedItem.readonly}
                iconProps={{ iconName: 'Delete' }}
                onClick={removeSelected}
              />
            </Fragment>
          );
      },
    },
  ];

  const updateSelected = (field: string) => {
    return (evt, val) => {
      const newSelection = {
        ...selectedItem,
        [field]: val,
      };
      setSelectedItem(newSelection);
      setItems(items.map((i) => (i.key === newSelection.key ? newSelection : i)));
    };
  };

  const savePendingEdits = () => {
    props.onUpdateFeed(items);
  };

  const addItem = () => {
    const newItem = {
      key: uuid(),
      text: '',
      url: '',
    } as PackageSourceFeed;

    const newItems = items.concat([newItem]);

    // select newest to display in the editor
    setSelectedItem(newItem);

    // update the detail view
    setItems(newItems);

    // update the selection
    selection.setItems(newItems, true);
    selection.setKeySelected(newItem.key, true, false);
    setSelection(selection);

    telemetryClient.track('PackageFeedAdded', {});

    setEditRow(true);
  };

  const removeSelected = async () => {
    if (
      await confirm(
        formatMessage('Delete this feed?'),
        formatMessage('Are you sure you want to remove this feed source?')
      )
    ) {
      setItems(items.filter((i) => i.key !== selectedItem.key));
      setSelectedItem(undefined);
      telemetryClient.track('PackageFeedDeleted', {});
    }
  };

  const closeDialog = () => {
    savePendingEdits();
    props.closeDialog();
  };

  return (
    <DialogWrapper
      dialogType={DialogTypes.Customer}
      isOpen={!props.hidden}
      minWidth={900}
      subText={uitext.subTitle}
      title={uitext.title}
      onDismiss={props.closeDialog}
    >
      <div data-is-scrollable="true" style={{ minHeight: '300px', maxHeight: '400px', overflow: 'auto' }}>
        <DetailsList
          selectionPreservedOnEmptyClick
          ariaLabelForSelectAllCheckbox={formatMessage('Toggle selection for all items')}
          ariaLabelForSelectionColumn={formatMessage('Toggle selection')}
          checkboxVisibility={CheckboxVisibility.hidden}
          checkButtonAriaLabel={formatMessage('Row checkbox')}
          columns={columns}
          items={items}
          layoutMode={DetailsListLayoutMode.justified}
          selection={selection}
          selectionMode={SelectionMode.single}
          setKey="set"
        />
      </div>
      <ActionButton iconProps={{ iconName: 'Add' }} onClick={addItem}>
        {formatMessage('Add a new feed')}
      </ActionButton>
      <DialogFooter>
        <PrimaryButton onClick={closeDialog}>{formatMessage('Done')}</PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
