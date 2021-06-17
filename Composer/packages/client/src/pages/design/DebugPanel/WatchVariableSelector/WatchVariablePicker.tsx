// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useMemo, useCallback, useEffect, useRef, FocusEvent, KeyboardEvent, useState, FormEvent } from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import debounce from 'lodash/debounce';
import { IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import {
  IContextualMenuItem,
  IContextualMenuItemProps,
  ContextualMenu,
  DirectionalHint,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { NeutralColors } from '@uifabric/fluent-theme';

import { getDefaultFontSettings } from '../../../../recoilModel/utils/fontUtil';

import { PropertyTreeItem, PropertyItem } from './utils/components/PropertyTreeItem';
import { useNoSearchResultMenuItem } from './utils/hooks/useNoSearchResultMenuItem';
import { computePropertyItemTree, getAllNodes, WatchDataPayload } from './utils/helpers';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

type WatchVariablePickerProps = {
  payload: WatchDataPayload;
  disabled?: boolean;
  variableId: string;
  path: string;
  onSelectPath: (id: string, selectedPath: string) => void;
};

const getStrings = () => {
  return {
    emptyMessage: formatMessage('No properties found'),
    searchPlaceholder: formatMessage('Add a property'),
  };
};

const defaultTreeItemHeight = 36;

const labelContainerStyle: IStackStyles = {
  root: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: defaultTreeItemHeight },
};

export const WatchVariablePicker = React.memo((props: WatchVariablePickerProps) => {
  const { payload, variableId, path, onSelectPath } = props;
  const [query, setQuery] = useState(path);
  const inputBoxElement = useRef<ITextField | null>(null);
  const pickerContainerElement = useRef<null | HTMLDivElement>(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [items, setItems] = useState<IContextualMenuItem[]>([]);
  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const uiStrings = useMemo(() => getStrings(), []);

  useEffect(() => {
    setQuery(path);
  }, [path]);

  const noSearchResultMenuItem = useNoSearchResultMenuItem(uiStrings.emptyMessage);

  const propertyTreeConfig = useMemo(() => {
    const { properties } = (payload as WatchDataPayload).data;
    return { root: computePropertyItemTree(properties) };
  }, [payload]);

  const getContextualMenuItems = (): IContextualMenuItem[] => {
    const { root } = propertyTreeConfig;
    const { nodes, levels, paths } = getAllNodes<PropertyItem>(root, {
      expanded: propertyTreeExpanded,
      skipRoot: true,
    });

    const onToggleExpand = (itemId: string, expanded: boolean) => {
      setPropertyTreeExpanded({ ...propertyTreeExpanded, [itemId]: expanded });
    };

    return nodes.map((node) => ({
      key: node.id,
      text: node.name,
      secondaryText: paths[node.id],
      onClick: (event) => {
        if (node.children.length) {
          event?.preventDefault();
          onToggleExpand(node.id, !propertyTreeExpanded[node.id]);
        } else {
          const path = paths[node.id];
          setQuery(path);
          event?.preventDefault();
          onHideContextualMenu();
          onSelectPath(variableId, path);
        }
      },
      data: {
        node,
        path: paths[node.id],
        level: levels[node.id] - 1,
        onToggleExpand,
      },
    }));
  };

  const onShowContextualMenu = (event: FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    setShowContextualMenu(true);
  };

  const onHideContextualMenu = () => {
    setShowContextualMenu(false);
  };

  const flatPropertyListItems = React.useMemo(() => {
    const { root } = propertyTreeConfig;
    const { nodes, paths } = getAllNodes<PropertyItem>(root, { skipRoot: true });

    return nodes.map((node) => ({
      text: node.id,
      key: node.id,
      secondaryText: paths[node.id],
      onClick: (event) => {
        event?.preventDefault();
        const path = paths[node.id];
        onSelectPath(variableId, path);
        onHideContextualMenu();
      },
      data: {
        node,
        path: paths[node.id],
        level: 0,
      },
    })) as IContextualMenuItem[];
  }, [payload, propertyTreeConfig]);

  const getFilterPredicate = useCallback((q: string) => {
    return (item: IContextualMenuItem) =>
      item.data.node.children.length === 0 && item.secondaryText?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }, []);

  const menuItems = useMemo(getContextualMenuItems, [payload, propertyTreeExpanded]);

  useEffect(() => setItems(menuItems), [menuItems]);

  const handleDebouncedSearch: () => void = useCallback(
    debounce(() => {
      if (query) {
        const searchableItems = flatPropertyListItems;

        const predicate = getFilterPredicate(query);

        const filteredItems = searchableItems.filter(predicate);

        if (!filteredItems || !filteredItems.length) {
          filteredItems.push(noSearchResultMenuItem);
        }

        setItems(filteredItems);
      } else {
        setItems(menuItems);
      }
    }, 500),
    [menuItems, flatPropertyListItems, noSearchResultMenuItem, query]
  );

  useEffect(() => {
    handleDebouncedSearch();
  }, [menuItems, flatPropertyListItems, noSearchResultMenuItem, query]);

  const onTextBoxFocus = (event: FocusEvent<HTMLInputElement>) => {
    onShowContextualMenu(event);
  };

  const onTextBoxKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // enter
      if (event.keyCode == 13) {
        event.preventDefault();
        onSelectPath(variableId, query);
        onHideContextualMenu();
        inputBoxElement.current?.blur();
      }
    },
    [variableId, query]
  );

  const onDismiss = useCallback(() => {
    setPropertyTreeExpanded({});
    onHideContextualMenu();
  }, []);

  return (
    <div
      ref={pickerContainerElement}
      css={{
        margin: '0',
        width: '240px',
      }}
    >
      <TextField
        componentRef={inputBoxElement}
        id={variableId}
        placeholder={uiStrings.searchPlaceholder}
        styles={{
          field: {
            fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
            fontSize: 12,
          },
          fieldGroup: {
            backgroundColor: 'transparent',
            height: 16,
          },
          root: {
            selectors: {
              '.ms-TextField-fieldGroup': {
                border: 'none',
              },
            },
          },
        }}
        value={query}
        onChange={(evt: FormEvent<HTMLInputElement | HTMLTextAreaElement>, val: string | undefined) => {
          setQuery(val ?? '');
        }}
        onFocus={onTextBoxFocus}
        onKeyDown={onTextBoxKeyDown}
      />
      <ContextualMenu
        useTargetAsMinWidth
        useTargetWidth
        contextualMenuItemAs={(itemProps: IContextualMenuItemProps) => {
          const {
            item: { secondaryText: path },
          } = itemProps;

          const { onToggleExpand, level, node } = itemProps.item.data as {
            node: PropertyItem;
            onToggleExpand: (itemId: string, expanded: boolean) => void;
            level: number;
          };

          const renderLabel = () => {
            const pathNodes = (path ?? '').split('.');
            return (
              <Stack horizontal styles={labelContainerStyle} verticalAlign="center">
                {pathNodes.map((pathNode, idx) => (
                  <Text
                    key={`segment-${idx}`}
                    styles={{
                      root: {
                        color: idx === pathNodes.length - 1 ? NeutralColors.black : NeutralColors.gray70,
                      },
                    }}
                    variant="small"
                  >
                    {`${pathNode}${idx === pathNodes.length - 1 && node.children.length === 0 ? '' : '.'}`}
                  </Text>
                ))}
              </Stack>
            );
          };

          const renderSearchResultLabel = () => (
            <Stack styles={labelContainerStyle} verticalAlign="center">
              <Text variant="small">{path}</Text>
            </Stack>
          );

          return (
            <PropertyTreeItem
              expanded={propertyTreeExpanded[node.id]}
              item={node}
              level={level}
              onRenderLabel={query ? renderSearchResultLabel : renderLabel}
              onToggleExpand={onToggleExpand}
            />
          );
        }}
        delayUpdateFocusOnHover={false}
        directionalHint={DirectionalHint.bottomLeftEdge}
        hidden={!showContextualMenu}
        items={items}
        shouldFocusOnMount={false}
        styles={{
          root: {
            maxHeight: '200px',
            overflowY: 'auto',
            width: '240px',
          },
        }}
        target={pickerContainerElement}
        onDismiss={onDismiss}
        onItemClick={onHideContextualMenu}
      />
    </div>
  );
});
