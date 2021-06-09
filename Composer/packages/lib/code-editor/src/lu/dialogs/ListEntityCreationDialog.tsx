// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { Announced } from 'office-ui-fabric-react/lib/Announced';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { DetailsList, ISelection, IColumn, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import debounce from 'lodash/debounce';

import { ListEntity, ListEntityItem } from '../types';

import { TagInput } from './tags/TagInput';

const detailsListStyles = { root: { overflowY: 'hidden' }, contentWrapper: { height: 400, overflowY: 'auto' } };
const normalizedValueTextField = { field: { padding: 0 }, fieldGroup: { backgroundColor: 'transparent' } };
const dialogModalProps = {
  isBlocking: true,
  styles: { main: { maxWidth: '840px !important', width: '840px !important' } },
};

const containerStackTokens = { childrenGap: 16 };

const nameRegex = /^[a-zA-Z0-9-_]+$/;

type Props = {
  onCreateListEntity: (listEntity: ListEntity) => void;
  onDismiss: () => void;
};

export const ListEntityCreationDialog = (props: Props) => {
  const { onDismiss, onCreateListEntity } = props;
  const [listEntity, setListEntity] = React.useState<ListEntity>({ entityType: 'list', name: '', items: [] });
  let listEntityId = 0;

  const [nameValidationError, setNameValidationError] = React.useState('');

  const validateEntityName = React.useCallback(
    debounce((name?: string) => {
      if (name && !nameRegex.test(name)) {
        setNameValidationError(
          formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.')
        );
      } else {
        setNameValidationError('');
      }
    }, 300),
    []
  );

  const [selectedItems, setSelectedItems] = React.useState<ListEntityItem[]>([]);
  const selection: ISelection = React.useRef(
    new Selection({
      onSelectionChanged: () => setSelectedItems(selection.getSelection() as ListEntityItem[]),
      selectionMode: SelectionMode.multiple,
    })
  ).current;

  const changeEntityName = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setListEntity((currentEntity) => ({ ...currentEntity, name: newValue ?? currentEntity.name }));
      validateEntityName(newValue);
    },
    []
  );

  const changeNormalizedValue = React.useCallback(
    (item: ListEntityItem) => (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setListEntity((currentEntity) => {
        const clonedEntity = { ...currentEntity };
        const foundIdx = currentEntity.items.findIndex((ci) => ci === item);
        if (foundIdx !== -1) {
          const foundItem = clonedEntity.items[foundIdx];
          clonedEntity.items = clonedEntity.items.map((item, idx) =>
            idx === foundIdx ? { ...foundItem, normalizedValue: newValue ?? foundItem.normalizedValue } : item
          );
        }

        return clonedEntity;
      });
    },
    []
  );

  const changeSynonyms = React.useCallback(
    (item: ListEntityItem) => (synonyms: string[]) => {
      setListEntity((currentEntity) => {
        const clonedEntity = { ...currentEntity };
        const foundIdx = currentEntity.items.findIndex((ci) => ci.id === item.id);
        if (foundIdx !== -1) {
          const foundItem = clonedEntity.items[foundIdx];
          clonedEntity.items = clonedEntity.items.map((item, idx) =>
            idx === foundIdx ? { ...foundItem, synonyms } : item
          );
        }

        return clonedEntity;
      });
    },
    []
  );

  const deleteSelectedListEntityItems = React.useCallback(() => {
    setListEntity((currentEntity) => {
      const clonedEntity = { ...currentEntity };
      clonedEntity.items = clonedEntity.items.filter((item) => !selectedItems.map((si) => si.id).includes(item.id));

      return clonedEntity;
    });
  }, [selectedItems]);

  const addListEntityItem = React.useCallback(() => {
    setListEntity((currentEntity) => {
      const clonedEntity = { ...currentEntity };
      clonedEntity.items = [...clonedEntity.items, { id: listEntityId, normalizedValue: '', synonyms: [] }];
      listEntityId++;
      return clonedEntity;
    });
  }, []);

  const commandBarItems = React.useMemo<ICommandBarItemProps[]>(
    () => [
      {
        key: 'addItem',
        iconProps: { iconName: 'Add' },
        name: formatMessage('Add'),
        onClick: addListEntityItem,
      },
      {
        key: 'deleteItem',
        iconProps: { iconName: 'Trash' },
        name: formatMessage('Delete'),
        disabled: !selectedItems.length,
        onClick: deleteSelectedListEntityItems,
      },
    ],
    [deleteSelectedListEntityItems, addListEntityItem, selectedItems]
  );

  const columns = React.useMemo<IColumn[]>(() => {
    return [
      {
        key: 'normalizedValue',
        name: formatMessage('Normalized value'),
        isResizable: true,
        onRender: (item: ListEntityItem) => {
          return (
            <TextField
              borderless
              data-selection-disabled
              placeholder={formatMessage('Enter a value')}
              styles={normalizedValueTextField}
              value={item.normalizedValue}
              onChange={changeNormalizedValue(item)}
            />
          );
        },
        minWidth: 100,
        maxWidth: 150,
      },
      {
        key: 'synonyms',
        name: formatMessage('Synonyms'),
        isResizable: true,
        onRender: (item: ListEntityItem) => {
          const values = item.synonyms;
          return (
            <TagInput
              removeOnBackspace
              editable={false}
              placeholder={formatMessage('Type a synonym and press enter')}
              tags={values}
              onChange={changeSynonyms(item)}
            />
          );
        },
        minWidth: 500,
      },
    ];
  }, [changeNormalizedValue, changeSynonyms]);

  const createListEntity = React.useCallback(() => {
    onCreateListEntity(listEntity);
  }, [onCreateListEntity, listEntity]);

  const creationDisabled = !listEntity.name || !listEntity.items.length;

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('title'),
        subText: formatMessage('subText'),
      }}
      hidden={false}
      modalProps={dialogModalProps}
      onDismiss={onDismiss}
    >
      <Stack tokens={containerStackTokens}>
        <TextField
          required
          errorMessage={nameValidationError}
          label={formatMessage('Entity name')}
          placeholder={formatMessage('Enter a name for your list entity')}
          value={listEntity.name}
          onChange={changeEntityName}
        />
        <CommandBar items={commandBarItems} />
        <DetailsList
          selectionPreservedOnEmptyClick
          columns={columns}
          items={listEntity.items}
          selection={selection}
          styles={detailsListStyles}
          onShouldVirtualize={() => false}
        />
      </Stack>
      {selection ? (
        <Announced
          message={formatMessage(
            `{
                count, plural,
                =0 {No items selected}
                =1 {One item is selected}
                other {# items are selected}
            }`,
            { count: selection.count }
          )}
        />
      ) : null}
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton disabled={creationDisabled} text={formatMessage('Create')} onClick={createListEntity} />
      </DialogFooter>
    </Dialog>
  );
};
