// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { DefaultPalette } from '@uifabric/styling';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';
import { IStackItemProps, IStackItemStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Resizable, ResizeCallback } from 're-resizable';
import * as React from 'react';
import { FormDialogSchema } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { dispatcherState, userSettingsState } from '../../recoilModel';

import { FormDialogSchemaListHeader } from './FormDialogSchemaListHeader';

const isEmptyObject = (objStr: string) => objStr === '{}';

const Root = styled(Stack)<{
  loading: boolean;
}>(
  {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRight: '1px solid #c4c4c4',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    '& .ms-List-cell': {
      minHeight: '36px',
    },
  },
  (props) =>
    props.loading
      ? {
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255, 0.6)',
            zIndex: 1,
          },
        }
      : null
);

const oneLinerStyles = classNamesFunction<IStackItemProps, IStackItemStyles>()({
  root: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const EmptyView = styled(Stack)({
  opacity: 0.5,
  padding: 8,
  textAlign: 'center',
});

type SchemaItemProps = {
  id: string;
  selected: boolean;
  isEmpty?: boolean;
  onClick: (name: string) => void;
  onDelete: (name: string) => void;
  onGenerate: (name: string) => void;
};

const FormDialogSchemaItem = React.memo((props: SchemaItemProps) => {
  const { id, onClick, onDelete, onGenerate, selected = false, isEmpty = false } = props;

  const clickHandler = React.useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  const deleteHandler = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();

      onDelete(id);
    },
    [id, onDelete]
  );

  const runHandler = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();

      onGenerate(id);
    },
    [id, onGenerate]
  );

  return (
    <Stack
      data-is-focusable
      horizontal
      styles={{
        root: {
          padding: '0 8px',
          cursor: 'pointer',
          background: selected ? DefaultPalette.neutralLighter : 'transparent',
        },
      }}
      tokens={{ childrenGap: 8 }}
      verticalAlign="center"
      onClick={clickHandler}
    >
      <Icon iconName="Chat" />
      <Stack.Item grow styles={oneLinerStyles}>
        {id}
      </Stack.Item>
      <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
        <IconButton
          disabled={isEmpty}
          iconProps={{ iconName: 'Rerun' }}
          title={formatMessage('Generate')}
          onClick={runHandler}
        />
        <IconButton iconProps={{ iconName: 'Delete' }} title={formatMessage('Delete')} onClick={deleteHandler} />
      </Stack>
    </Stack>
  );
});

type FormDialogSchemaListProps = {
  items: readonly FormDialogSchema[];
  selectedId: string | undefined;
  onSelectItem: (schemaId: string) => void;
  onDeleteItem: (schemaId: string) => void;
  onGenerateFormDialogs: (schemaId: string) => void;
  onCreateItem: () => void;
  loading?: boolean;
};

export const FormDialogSchemaList: React.FC<FormDialogSchemaListProps> = React.memo((props) => {
  const { selectedId, items, onDeleteItem, onSelectItem, onCreateItem, onGenerateFormDialogs, loading = false } = props;

  const { 0: query, 1: setQuery } = React.useState('');
  const delayedSetQuery = debounce((newValue) => setQuery(newValue), 300);
  const { updateUserSettings } = useRecoilValue(dispatcherState);
  const { dialogNavWidth } = useRecoilValue(userSettingsState);

  const filteredItems = React.useMemo(() => {
    return items.filter(({ id }) => id.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }, [query, items, selectedId]);

  const onFilter = (_e?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetQuery(newValue);
    }
  };

  const handleResize: ResizeCallback = React.useCallback(
    (_e, _dir, _ref, d) => {
      updateUserSettings({ dialogNavWidth: dialogNavWidth + d.width });
    },
    [updateUserSettings]
  );

  const renderCell = React.useCallback(
    (item) => (
      <FormDialogSchemaItem
        key={item.id}
        id={item.id}
        isEmpty={isEmptyObject(item.content)}
        selected={selectedId === item.id}
        onClick={onSelectItem}
        onDelete={onDeleteItem}
        onGenerate={onGenerateFormDialogs}
      />
    ),
    [selectedId, onSelectItem, onDeleteItem, onGenerateFormDialogs]
  );

  return (
    <Resizable
      enable={{
        right: true,
      }}
      maxWidth={500}
      minWidth={180}
      size={{ width: dialogNavWidth, height: 'auto' }}
      onResizeStop={handleResize}
    >
      <Root aria-label={formatMessage('Navigation pane')} loading={loading} role="region" tokens={{ childrenGap: 8 }}>
        <FormDialogSchemaListHeader
          loading={loading}
          searchDisabled={!items.length}
          onChangeQuery={onFilter}
          onCreateItem={onCreateItem}
        />
        <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
          <div
            aria-label={formatMessage(
              `{
                schemaNum, plural,
                =0 {No schemas}
                =1 {One schema}
              other {# schemas}
            } have been found.
            {
              schemaNum, select,
                  0 {}
                other {Press down arrow key to navigate the search results}
            }`,
              { schemaNum: items.length }
            )}
            aria-live={'polite'}
          />
          {filteredItems.length ? (
            <List<FormDialogSchema> items={filteredItems} onRenderCell={renderCell} />
          ) : (
            <EmptyView verticalFill horizontalAlign="center" verticalAlign="center">
              {query
                ? formatMessage('No form dialog schema matches your filtering criteria!')
                : formatMessage('Create a new form dialog schema by clicking + above.')}
            </EmptyView>
          )}
        </FocusZone>
      </Root>
    </Resizable>
  );
});
