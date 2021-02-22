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
import { useApplicationApi } from '@bfc/extension-client';

import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { v4 as uuid } from 'uuid';

import { PackageSourceFeed } from './Library';

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
  title: string;
  feeds: PackageSourceFeed[];
  closeDialog: any;
  onUpdateFeed: any;
}
export const FeedModal: React.FC<WorkingModalProps> = (props) => {
  const [selectedItem, setSelectedItem] = useState<PackageSourceFeed | undefined>(undefined);
  const [items, setItems] = useState<PackageSourceFeed[]>(props.feeds);
  const [editRow, setEditRow] = useState<boolean>(false);
  const { confirm } = useApplicationApi();

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
        } else {
          setSelectedItem(undefined);
        }
      },
    })
  );

  useEffect(() => {
    setItems(props.feeds);
  }, [props.feeds]);

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
          return <DisplayField text={item.text} readonly={item.readonly} />;
        return (
          <TextField
            placeholder={formatMessage('Feed Name')}
            value={selectedItem?.text}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('text')}
            styles={{ field: { fontSize: 12 } }}
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
            placeholder={formatMessage('URL')}
            value={selectedItem ? selectedItem.url : ''}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('url')}
            styles={{ field: { fontSize: 12 } }}
          />
        );
      },
    },
    {
      key: 'column3',
      minWidth: 80,
      isResizable: false,
      name: '',
      onRender: (item: PackageSourceFeed) => {
        if (selectedItem && item.key === selectedItem.key && !editRow)
          return (
            <Fragment>
              <IconButton
                iconProps={{ iconName: 'Edit' }}
                onClick={() => setEditRow(true)}
                disabled={!selectedItem || selectedItem.readonly}
              />
              <IconButton
                iconProps={{ iconName: 'Delete' }}
                onClick={removeSelected}
                disabled={!selectedItem || selectedItem.readonly}
              />
            </Fragment>
          );

        if (selectedItem && item.key === selectedItem.key && editRow)
          return (
            <IconButton
              iconProps={{ iconName: 'Checkmark' }}
              onClick={() => {
                setEditRow(false);
                props.onUpdateFeed(selectedItem.key, selectedItem);
              }}
              disabled={!selectedItem || !selectedItem.text || !selectedItem.url || selectedItem.readonly}
            />
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
    };
  };

  const addItem = () => {
    const newItem = {
      key: uuid(),
      text: formatMessage('New Feed'),
      url: 'http://',
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

    setEditRow(true);


  };

  const removeSelected = async () => {
    if (
      await confirm(
        formatMessage('Delete this feed?'),
        formatMessage('Are you sure you want to remove this feed source?')
      )
    ) {
      setSelectedItem(undefined);
      props.onUpdateFeed(selectedItem.key, null);
    }
  };

  return (
    <DialogWrapper
      isOpen={!props.hidden}
      dialogType={DialogTypes.Customer}
      minWidth={900}
      title={uitext.title}
      subText={uitext.subTitle}
      onDismiss={props.closeDialog}
    >
      <div style={{ minHeight: '300px', maxHeight: '400px', overflow: 'auto' }} data-is-scrollable="true">
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          selectionMode={SelectionMode.single}
          layoutMode={DetailsListLayoutMode.justified}
          checkboxVisibility={CheckboxVisibility.hidden}
          selection={selection}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn={formatMessage('Toggle selection')}
          ariaLabelForSelectAllCheckbox={formatMessage('Toggle selection for all items')}
          checkButtonAriaLabel={formatMessage('Row checkbox')}
        />
      </div>
      <ActionButton iconProps={{ iconName: 'Add' }} onClick={addItem}>
        {formatMessage('Add a new feed')}
      </ActionButton>
      <DialogFooter>
        <PrimaryButton onClick={props.closeDialog}>{formatMessage('Done')}</PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
