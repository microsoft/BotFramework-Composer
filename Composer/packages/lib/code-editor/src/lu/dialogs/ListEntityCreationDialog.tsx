// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TagInput } from '@bfc/ui-shared';
import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { Announced } from 'office-ui-fabric-react/lib/Announced';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import {
  DetailsList,
  DetailsRow,
  IColumn,
  IDetailsRowProps,
  ISelection,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { ListEntity, ListEntityItem } from '../types';

import { useListEntityValidation } from './useListEntityValidation';

const listEntityDocUrl = '';

const defaultRowsToShow = 6;
const minRowHeight = 60;

const SubText = styled(Stack.Item)({
  marginBottom: 24,
});

const SynonymInput = styled(TagInput)({
  border: 'none',
});

const commandBarStyles = {
  root: {
    padding: 0,
  },
};

const detailsRowStyles = {
  cell: { display: 'inline-flex', alignItems: 'center' },
  checkCell: { display: 'inline-flex', alignItems: 'center' },
};
const textFieldStyles = { fieldGroup: { width: '50%' } };
const detailsListStyles = {
  root: { overflowY: 'hidden' },
  contentWrapper: { height: minRowHeight * defaultRowsToShow, overflowY: 'auto' },
};
const normalizedValueTextField = { field: { padding: 0 }, fieldGroup: { backgroundColor: 'transparent' } };
const dialogModalProps = {
  isBlocking: true,
};

const containerStackTokens = { childrenGap: 24 };

type Props = {
  onCreateListEntity: (listEntity: ListEntity) => void;
  onDismiss: () => void;
};

export const ListEntityCreationDialog = (props: Props) => {
  const { onDismiss, onCreateListEntity } = props;
  const [listEntity, setListEntity] = React.useState<ListEntity>({ entityType: 'list', name: '', items: [] });
  let listEntityId = 0;

  const listRootRef = React.useRef<HTMLDivElement>(null);

  const { hasErrors, nameError, itemErrors, itemsTouched } = useListEntityValidation(listEntity);

  const [selectedItems, setSelectedItems] = React.useState<ListEntityItem[]>([]);
  const selection: ISelection = React.useRef(
    new Selection({
      onSelectionChanged: () => setSelectedItems(selection.getSelection() as ListEntityItem[]),
      selectionMode: SelectionMode.multiple,
    })
  ).current;

  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const changeEntityName = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setListEntity((currentEntity) => ({ ...currentEntity, name: newValue ?? currentEntity.name }));
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

  const scrollToItemByIndex = React.useCallback((idx: number) => {
    scrollTimeoutRef.current = setTimeout(() => {
      listRootRef.current
        ?.querySelector(`div.ms-List-cell[data-list-index="${idx}"]`)
        ?.scrollIntoView({ behavior: 'smooth' });
      scrollTimeoutRef.current = undefined;
    }, 300);
  }, []);

  const addListEntityItem = React.useCallback(() => {
    setListEntity((currentEntity) => {
      const clonedEntity = { ...currentEntity };
      clonedEntity.items = [...clonedEntity.items, { id: listEntityId, normalizedValue: '', synonyms: [] }];
      listEntityId++;

      scrollToItemByIndex(currentEntity.items.length);
      return clonedEntity;
    });
  }, []);

  const commandBarItems = React.useMemo<ICommandBarItemProps[]>(
    () => [
      {
        key: 'addItem',
        iconProps: { iconName: 'Add' },
        name: formatMessage('Add row'),
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
              autoComplete="off"
              errorMessage={itemsTouched[item.id] ? itemErrors[item.id] : ''}
              placeholder={formatMessage('Enter a value')}
              styles={normalizedValueTextField}
              value={item.normalizedValue}
              onChange={changeNormalizedValue(item)}
            />
          );
        },
        minWidth: 200,
        maxWidth: 250,
      },
      {
        key: 'synonyms',
        name: formatMessage('Synonyms'),
        isResizable: true,
        onRender: (item: ListEntityItem) => {
          const values = item.synonyms;
          return (
            <SynonymInput
              removeOnBackspace
              editable={false}
              placeholder={formatMessage('Enter a synonym and press enter')}
              tags={values}
              onChange={changeSynonyms(item)}
            />
          );
        },
        minWidth: 500,
      },
    ];
  }, [changeNormalizedValue, changeSynonyms, itemErrors]);

  const createListEntity = React.useCallback(() => {
    onCreateListEntity(listEntity);
  }, [onCreateListEntity, listEntity]);

  const renderRow: IRenderFunction<IDetailsRowProps> = React.useCallback(
    (rowProps) => (rowProps ? <DetailsRow {...rowProps} styles={detailsRowStyles} /> : null),
    []
  );

  const createDisabled = !listEntity.name || !listEntity.items.length || hasErrors;

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Add a list entity'),
      }}
      hidden={false}
      modalProps={dialogModalProps}
      styles={{ main: { width: '960px !important', minWidth: '960px !important' } }}
      onDismiss={onDismiss}
    >
      <SubText>
        {formatMessage.rich(
          'A list entity represents a fixed, closed set of related words along with their synonyms. The normalized value is the value returned when any of the corresponding synonyms are recognized. <link>Learn more about list entities</link>',
          {
            link: ({ children }) => (
              <Link key="list-entity-doc-link" href={listEntityDocUrl} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </SubText>
      <Stack tokens={containerStackTokens}>
        <TextField
          required
          autoComplete="off"
          errorMessage={itemsTouched.nameField ? nameError : ''}
          label={formatMessage('Name')}
          placeholder={formatMessage('Name your list entity')}
          styles={textFieldStyles}
          value={listEntity.name}
          onChange={changeEntityName}
        />
        <div ref={listRootRef}>
          <CommandBar items={commandBarItems} styles={commandBarStyles} />
          <DetailsList
            selectionPreservedOnEmptyClick
            columns={columns}
            items={listEntity.items}
            selection={selection}
            styles={detailsListStyles}
            onRenderRow={renderRow}
            onShouldVirtualize={() => false}
          />
        </div>
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
        <PrimaryButton disabled={createDisabled} text={formatMessage('Create')} onClick={createListEntity} />
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
