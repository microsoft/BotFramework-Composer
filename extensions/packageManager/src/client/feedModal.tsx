// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PrimaryButton, DialogFooter, DefaultButton } from 'office-ui-fabric-react';
import { useState, useEffect, Fragment } from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { IconButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useApplicationApi } from '@bfc/extension-client';

import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { v4 as uuid } from 'uuid';

import { PackageSourceFeed } from './Library';

const uitext = {
  title: formatMessage('Feeds'),
  subTitle: formatMessage('Manage the package sources'),
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

  const [selection, setSelection] = useState<Selection>(
    new Selection({
      onSelectionChanged: () => {
        if (selection.getSelectedCount() > 0) {
          setSelectedItem(selection.getSelection()[0] as PackageSourceFeed);
        } else {
          setSelectedItem(undefined);
        }
      },
      // canSelectItem: (item: PackageSourceFeed) => {
      //   return !item.readonly;
      // },
    })
  );

  useEffect(() => {
    setItems(props.feeds);
  }, [props.feeds]);

  useEffect(() => {
    if (selectedItem && selectedItem.text === 'New Feed') {
      console.log('set edit row true');
      setEditRow(true);
    } else {
      setEditRow(false);
    }
  }, [selectedItem?.key]);

  const columns = [
    { key: 'column1', name: 'Name', fieldName: 'text', minWidth: 100, maxWidth: 250, isResizable: true, onRender: (item: PackageSourceFeed) => {
      if (!selectedItem || item.key !== selectedItem.key || !editRow) return item.text;
      return <Fragment>
          <TextField
            placeholder={formatMessage('Feed Name')}
            value={selectedItem ? selectedItem.text : ''}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('text')}
          />
      </Fragment> },
    },
    { key: 'column2', name: 'URL', fieldName: 'url', minWidth: 450, isResizable: true, onRender: (item: PackageSourceFeed) => {
      if (!selectedItem || item.key !== selectedItem.key || !editRow) return item.url;
      return <Fragment>
          <TextField
            placeholder={formatMessage('URL')}
            value={selectedItem ? selectedItem.url : ''}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('url')}
          />
      </Fragment> },
    },
    { key: 'column3', minWidth: 80, isResizable: false, name: '', onRender: (item: PackageSourceFeed) => {
      if (selectedItem && item.key === selectedItem.key && !editRow)
      return <Fragment>
        <IconButton iconProps={{ iconName: 'Edit' }} onClick={()=>setEditRow(true)} disabled={!selectedItem || selectedItem.readonly} />
        <IconButton iconProps={{ iconName: 'Delete' }} onClick={removeSelected} disabled={!selectedItem || selectedItem.readonly} />
      </Fragment>;

      if (selectedItem && item.key === selectedItem.key && editRow)
      return <Fragment>
        <IconButton iconProps={{iconName: 'Checkmark'}} onClick={() => { setEditRow(false); props.onUpdateFeed(selectedItem.key, selectedItem) }}
                    disabled={!selectedItem || !selectedItem.text || !selectedItem.url || selectedItem.readonly}
         />
      </Fragment>;
    },}
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
      text: 'New Feed',
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
  };

  const removeSelected = async () => {
    if (await confirm(formatMessage('Delete this feed?'), formatMessage('Are you sure you want to remove this feed source?'))) {
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
      <div style={{ minHeight: '300px' }} data-is-scrollable="true">
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          selectionMode={SelectionMode.single}
          layoutMode={DetailsListLayoutMode.justified}
          checkboxVisibility={CheckboxVisibility.hidden}
          selection={selection}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn="Toggle selection"
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          checkButtonAriaLabel="Row checkbox"
        />
        <ActionButton iconProps={{iconName: 'Add'}} onClick={addItem}>Add</ActionButton>
        <DialogFooter>
          <PrimaryButton onClick={props.closeDialog}>Done</PrimaryButton>
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};
