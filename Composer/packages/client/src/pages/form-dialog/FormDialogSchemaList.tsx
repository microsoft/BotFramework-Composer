// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import formatMessage from 'format-message';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { CommandBarButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IStackItemProps, IStackItemStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { formDialogSchemaDialogExistsSelector, formDialogSchemaState } from '../../recoilModel';
import { colors } from '../../colors';

import { FormDialogSchemaListHeader } from './FormDialogSchemaListHeader';

const isEmptyObject = (objStr: string) => {
  if (!objStr) {
    return true;
  }

  const properties = get(JSON.parse(objStr), 'properties', undefined);
  return !properties;
};

const Root = styled(Stack)<{
  loading: boolean;
}>(
  {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRight: `1px solid ${colors.gray(60)}`,
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
            background: colors.transparentBg,
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

const ItemRoot = styled(Stack)(({ selected }: { selected: boolean }) => ({
  padding: '0 12px',
  cursor: 'pointer',
  background: selected ? colors.blue : 'transparent',
}));

const EmptyView = styled(Stack)({
  opacity: 0.5,
  padding: 8,
  fontSize: 14,
  textAlign: 'center',
});

type FormDialogSchemaItemProps = {
  projectId: string;
  schemaId: string;
  selected: boolean;
  onClick: (schemaId: string) => void;
  onDelete: (schemaId: string) => void;
  onGenerate: (schemaId: string) => void;
  onViewDialog: (schemaId: string) => void;
};

const FormDialogSchemaItem = React.memo((props: FormDialogSchemaItemProps) => {
  const { projectId, schemaId, onClick, onDelete, onGenerate, selected = false, onViewDialog } = props;

  const item = useRecoilValue(formDialogSchemaState({ projectId, schemaId }));
  const viewDialogActionDisabled = !useRecoilValue(formDialogSchemaDialogExistsSelector({ projectId, schemaId }));
  const generateActionDisabled = item?.content === '' || isEmptyObject(item?.content);

  const clickHandler = React.useCallback(() => {
    onClick(schemaId);
  }, [schemaId, onClick]);

  const deleteHandler = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();

      onDelete(schemaId);
    },
    [schemaId, onDelete]
  );

  const generateDialog = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();

      onGenerate(schemaId);
    },
    [schemaId, onGenerate]
  );

  const viewDialog = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();

      onViewDialog(schemaId);
    },
    [schemaId, onViewDialog]
  );

  const renderOverflowItem = React.useCallback(
    (item: IOverflowSetItemProps) => <CommandBarButton aria-label={item.name} role="menuitem" onClick={item.onClick} />,
    []
  );

  const renderOverflowButton = React.useCallback(
    (overflowItems?: IOverflowSetItemProps[]) => (
      <TooltipHost content={formatMessage('Actions')} directionalHint={DirectionalHint.rightCenter}>
        <IconButton
          data-is-focusable
          menuIconProps={{
            iconName: 'MoreVertical',
            style: { color: colors.gray(130) },
          }}
          menuProps={{ items: overflowItems || [] }}
          role="menuitem"
        />
      </TooltipHost>
    ),
    []
  );

  return (
    <ItemRoot
      data-is-focusable
      horizontal
      selected={selected}
      tokens={{ childrenGap: 8 }}
      verticalAlign="center"
      onClick={clickHandler}
    >
      <Stack.Item grow styles={oneLinerStyles}>
        {schemaId}
      </Stack.Item>
      <OverflowSet
        aria-label={formatMessage('Form dialog schema actions')}
        overflowItems={[
          {
            key: 'viewDialog',
            name: formatMessage('View dialog'),
            onClick: viewDialog,
            disabled: viewDialogActionDisabled,
          },
          {
            key: 'generateDialog',
            name: formatMessage('Generate dialog'),
            onClick: generateDialog,
            disabled: generateActionDisabled,
          },
          {
            key: 'deleteItem',
            name: formatMessage('Delete'),
            onClick: deleteHandler,
          },
        ]}
        role="menubar"
        onRenderItem={renderOverflowItem}
        onRenderOverflowButton={renderOverflowButton}
      />
    </ItemRoot>
  );
});

type FormDialogSchemaListProps = {
  projectId: string;
  items: readonly string[];
  selectedId: string | undefined;
  loading?: boolean;
  onSelectItem: (schemaId: string) => void;
  onDeleteItem: (schemaId: string) => void;
  onGenerate: (schemaId: string) => void;
  onViewDialog: (schemaId: string) => void;
  onCreateItem: () => void;
};

export const FormDialogSchemaList: React.FC<FormDialogSchemaListProps> = React.memo((props) => {
  const {
    projectId,
    selectedId,
    items,
    onDeleteItem,
    onSelectItem,
    onCreateItem,
    onGenerate,
    onViewDialog,
    loading = false,
  } = props;

  const { 0: query, 1: setQuery } = React.useState('');
  const delayedSetQuery = debounce((newValue) => setQuery(newValue), 300);

  const filteredItems = React.useMemo(() => {
    return query ? items.filter((item) => item.toLowerCase().indexOf(query.toLowerCase()) !== -1) : items;
  }, [query, items]);

  const onFilter = (_e?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetQuery(newValue);
    }
  };

  const renderItem = React.useCallback(
    (itemId) => (
      <FormDialogSchemaItem
        key={itemId}
        projectId={projectId}
        schemaId={itemId}
        selected={selectedId === itemId}
        onClick={onSelectItem}
        onDelete={onDeleteItem}
        onGenerate={onGenerate}
        onViewDialog={onViewDialog}
      />
    ),
    [selectedId, onSelectItem, onDeleteItem, onGenerate]
  );

  return (
    <Root aria-label={formatMessage('Navigation pane')} loading={loading} role="region" tokens={{ childrenGap: 8 }}>
      <FormDialogSchemaListHeader
        loading={loading}
        searchDisabled={!items.length}
        onChangeQuery={onFilter}
        onCreateItem={onCreateItem}
      />

      <div
        aria-label={formatMessage(
          `{
              itemCount, plural,
                =0 {No schemas}
                =1 {One schema}
              other {# schemas}
            } have been found.
            {
              itemCount, select,
                  0 {}
                other {Press down arrow key to navigate the search results}
            }`,
          { itemCount: items.length }
        )}
        aria-live="polite"
      />
      {filteredItems.length ? (
        <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
          {filteredItems.map(renderItem)}
        </FocusZone>
      ) : (
        <EmptyView verticalFill horizontalAlign="center" verticalAlign="center">
          {query
            ? formatMessage('No form dialog schema matches your filtering criteria!')
            : formatMessage('Create a new form dialog schema by clicking + above.')}
        </EmptyView>
      )}
    </Root>
  );
});
