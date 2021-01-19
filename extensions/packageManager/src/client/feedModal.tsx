// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PrimaryButton, DialogFooter, DefaultButton, CheckboxBase } from 'office-ui-fabric-react';
import { useState, useEffect } from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
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
  const [selection, setSelection] = useState<Selection>(
    new Selection({
      onSelectionChanged: () => {
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
    { key: 'column1', name: 'Name', fieldName: 'text', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Url', fieldName: 'url', minWidth: 100, maxWidth: 200, isResizable: true },
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

  const removeSelected = () => {
    setSelectedItem(undefined);
    props.onUpdateFeed(selectedItem.key, null);
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
        <DefaultButton onClick={addItem}>Add</DefaultButton>
        <DefaultButton onClick={removeSelected} disabled={!selectedItem || selectedItem.readonly}>
          Remove
        </DefaultButton>
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          selectionMode={SelectionMode.single}
          layoutMode={DetailsListLayoutMode.justified}
          checkboxVisibility={CheckboxVisibility.always}
          selection={selection}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn="Toggle selection"
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          checkButtonAriaLabel="Row checkbox"
        />
        <DialogFooter>
          <TextField
            // defaultValue={name}
            // errorMessage={errorMessage}
            label={formatMessage('Name')}
            placeholder={formatMessage('Feed Name')}
            value={selectedItem ? selectedItem.text : ''}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('text')}
          />
          <TextField
            // defaultValue={name}
            // errorMessage={errorMessage}
            label={formatMessage('URL')}
            placeholder={formatMessage('URL')}
            value={selectedItem ? selectedItem.url : ''}
            disabled={!selectedItem || selectedItem.readonly}
            onChange={updateSelected('url')}
          />
          <PrimaryButton
            onClick={() => props.onUpdateFeed(selectedItem.key, selectedItem)}
            disabled={!selectedItem || !selectedItem.text || !selectedItem.url || selectedItem.readonly}
          >
            Save
          </PrimaryButton>
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};
