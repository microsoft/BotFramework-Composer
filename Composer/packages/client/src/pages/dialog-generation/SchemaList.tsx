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
import { ISearchBoxProps, ISearchBoxStyles, SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { IStackItemProps, IStackItemStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Resizable, ResizeCallback } from 're-resizable';
import * as React from 'react';

import { useStoreContext } from '../../hooks/useStoreContext';

const Root = styled.div`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

const oneLinerStyles = classNamesFunction<IStackItemProps, IStackItemStyles>()({
  root: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const searchBoxStyles = classNamesFunction<ISearchBoxProps, ISearchBoxStyles>()({
  root: {
    flex: 1,
    borderBottom: '1px solid #edebe9',
    height: '45px',
    borderRadius: '0px',
    minWidth: 0,
  },
});

type SchemaItem = { id: string };

type SchemaItemProps = SchemaItem & {
  selected: boolean;
  onClick: (name: string) => void;
  onDelete: (name: string) => void;
};

const SchemaItem = React.memo((props: SchemaItemProps) => {
  const { id, onClick, onDelete, selected = false } = props;

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

  return (
    <Stack
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
      <IconButton iconProps={{ iconName: 'Delete' }} onClick={deleteHandler} />
    </Stack>
  );
});

type SchemaListProps = {
  items: readonly SchemaItem[];
  selectedId: string | undefined;
  onSelectItem: (schemaId: string) => void;
  onDeleteItem: (schemaId: string) => void;
  onCreateItem: () => void;
};

export const SchemaList: React.FC<SchemaListProps> = (props) => {
  const { selectedId, items, onDeleteItem, onSelectItem, onCreateItem } = props;

  const { 0: query, 1: setQuery } = React.useState('');
  const delayedSetQuery = debounce((newValue) => setQuery(newValue), 300);
  const {
    actions: { updateUserSettings },
    state: {
      userSettings: { dialogNavWidth: currentWidth },
    },
  } = useStoreContext();

  const filteredItems = React.useMemo(
    () => items.filter(({ id }) => id.toLowerCase().indexOf(query.toLowerCase()) !== -1),
    [query, selectedId, items]
  );

  const onFilter = (_e?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetQuery(newValue);
    }
  };

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    updateUserSettings({ dialogNavWidth: currentWidth + d.width });
  };

  return (
    <Resizable
      enable={{
        right: true,
      }}
      maxWidth={500}
      minWidth={180}
      size={{ width: currentWidth, height: 'auto' }}
      onResizeStop={handleResize}
    >
      <Root aria-label={formatMessage('Navigation pane')} role="region">
        <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
          <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
            <SearchBox
              underlined
              ariaLabel={formatMessage('Type schema name')}
              disabled={!items.length}
              iconProps={{ iconName: 'Filter' }}
              placeholder={formatMessage('Filter Schema')}
              styles={searchBoxStyles}
              onChange={onFilter}
            />
            <IconButton iconProps={{ iconName: 'Add' }} onClick={onCreateItem} />
          </Stack>
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
          <List<SchemaItem>
            items={filteredItems}
            onRenderCell={(item) =>
              item && (
                <SchemaItem
                  key={item.id}
                  data-is-focusable="true"
                  id={item.id}
                  selected={selectedId === item.id}
                  onClick={onSelectItem}
                  onDelete={onDeleteItem}
                />
              )
            }
          />
        </FocusZone>
      </Root>
    </Resizable>
  );
};
