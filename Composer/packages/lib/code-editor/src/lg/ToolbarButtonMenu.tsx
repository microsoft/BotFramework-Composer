// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { buildInFunctionsMap, getBuiltInFunctionInsertText } from '@bfc/built-in-functions';
import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import { DefaultPalette } from '@uifabric/styling';
import formatMessage from 'format-message';
import { IconButton, IButton } from 'office-ui-fabric-react/lib/Button';
import {
  ContextualMenuItem,
  IContextualMenuItem,
  IContextualMenuItemProps,
  IContextualMenuListProps,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack, IStackStyles } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { PropertyTreeItem } from './PropertyTreeItem';
import {
  ToolbarButtonPayload,
  TemplateRefPayload,
  FunctionRefPayload,
  PropertyRefPayload,
  PropertyItem,
} from './types';
import { useDebounce } from './useDebounce';
import { computePropertyItemTree, getAllNodes } from './utils';

const DEFAULT_TREE_ITEM_HEIGHT = 36;

const labelContainerStyle: IStackStyles = {
  root: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: DEFAULT_TREE_ITEM_HEIGHT },
};

const headerContainerStyles = {
  root: { height: 32 },
};

const Header = styled(Label)({
  padding: '0 8px',
  color: DefaultPalette.accent,
  fontSize: 12,
});

const OneLiner = styled.div({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '0 8px',
});

const buttonStyles = { icon: { color: NeutralColors.black } };

const searchFieldStyles = { root: { borderRadius: 0 }, iconContainer: { display: 'none' } };

const calloutProps = { styles: { calloutMain: { overflowY: 'hidden' } } };

const itemsContainerStyles = { root: { overflowY: 'auto', maxHeight: 216, width: 200, overflowX: 'hidden' } };

type ToolbarButtonMenuProps = {
  payload: ToolbarButtonPayload;
  disabled?: boolean;
};

const getIcon = (kind: ToolbarButtonPayload['kind']) => {
  switch (kind) {
    case 'functionRef':
      return 'Variable';
    case 'propertyRef':
      return 'Variable2';
    case 'templateRef':
      return 'ChatBot';
  }
};

const getStrings = (kind: ToolbarButtonPayload['kind']) => {
  switch (kind) {
    case 'functionRef':
      return {
        emptyMessage: formatMessage('No functions found'),
        searchPlaceholder: formatMessage('Search functions'),
        header: formatMessage('Insert prebuilt functions'),
      };
    case 'propertyRef':
      return {
        emptyMessage: formatMessage('No properties found'),
        searchPlaceholder: formatMessage('Search properties'),
        header: formatMessage('Insert property reference'),
      };
    case 'templateRef':
      return {
        emptyMessage: formatMessage('No templates found'),
        searchPlaceholder: formatMessage('Search templates'),
        header: formatMessage('Insert template reference'),
      };
  }
};

const TooltipItem = React.memo(({ text, tooltip }: { text?: string; tooltip?: string }) => (
  <TooltipHost content={tooltip} directionalHint={DirectionalHint.topRightEdge}>
    <OneLiner>{text}</OneLiner>
  </TooltipHost>
));

export const ToolbarButtonMenu = React.memo((props: ToolbarButtonMenuProps) => {
  const { payload, disabled = false } = props;

  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const [query, setQuery] = React.useState<string | undefined>();
  const debouncedQuery = useDebounce<string | undefined>(query, 300);
  const buttonRef = React.useRef<IButton>(null);
  const uiStrings = React.useMemo(() => getStrings(payload.kind), [payload.kind]);

  const getContextualMenuItems = (): IContextualMenuItem[] => {
    switch (payload.kind) {
      case 'templateRef': {
        const { templates, onSelectTemplate } = (payload as TemplateRefPayload).data;
        return templates.map((t, i) => ({
          text: t.name,
          key: `${i}-${t.name}`,
          secondaryText: t.body,
          onClick: () => onSelectTemplate(`${t.name}(${t.parameters.join(', ')})`),
        })) as IContextualMenuItem[];
      }
      case 'functionRef': {
        const { functions, onSelectFunction } = (payload as FunctionRefPayload).data;
        return functions.map((grouping: { key: string; name: string; children: string[] }) => {
          return {
            key: grouping.key,
            text: grouping.name,
            target: '_blank',
            subMenuProps: {
              calloutProps: { calloutMaxHeight: 432 },
              contextualMenuItemAs: (itemProps: IContextualMenuItemProps) => {
                return (
                  <TooltipItem
                    text={itemProps.item.text}
                    tooltip={buildInFunctionsMap.get(itemProps.item.key)?.Introduction}
                  />
                );
              },
              items: grouping.children.map((key: string) => {
                return {
                  key: key,
                  text: key,
                  onClick: () => onSelectFunction(getBuiltInFunctionInsertText(key)),
                };
              }),
            },
          };
        });
      }
      case 'propertyRef': {
        const { properties, onSelectProperty } = (payload as PropertyRefPayload).data;
        const root = computePropertyItemTree(properties);
        const { nodes, levels, paths } = getAllNodes<PropertyItem>(root, {
          expanded: propertyTreeExpanded,
          skipRoot: true,
        });

        const onToggleExpand = (itemId: string, expanded: boolean) => {
          setPropertyTreeExpanded({ ...propertyTreeExpanded, [itemId]: expanded });
        };

        return nodes.map((node) => ({
          key: node.id,
          text: node.id,
          secondaryText: paths[node.id],
          onClick: (ev) => {
            if (node.children.length) {
              ev?.preventDefault();
              onToggleExpand(node.id, !propertyTreeExpanded[node.id]);
            } else {
              const path = paths[node.id];
              onSelectProperty(path);
            }
          },
          data: {
            node,
            path: paths[node.id],
            level: levels[node.id] - 1,
            onToggleExpand,
          },
        }));
      }
    }
  };

  const flatFunctionListItems = React.useMemo(() => {
    if (payload.kind === 'functionRef') {
      const { functions, onSelectFunction } = (payload as FunctionRefPayload).data;
      return functions
        .reduce((acc, f) => {
          if (f.children && f.children.length) {
            acc.push(...f.children);
          }

          return acc;
        }, [] as string[])
        .map((key) => ({
          text: key,
          key,
          onClick: () => onSelectFunction(getBuiltInFunctionInsertText(key)),
        })) as IContextualMenuItem[];
    }

    return [] as IContextualMenuItem[];
  }, [payload]);

  const flatPropertyListItems = React.useMemo(() => {
    if (payload.kind === 'propertyRef') {
      const { properties, onSelectProperty } = (payload as PropertyRefPayload).data;

      const root = computePropertyItemTree(properties);
      const { nodes, paths } = getAllNodes<PropertyItem>(root, { skipRoot: true });

      return nodes.map((node) => ({
        text: node.id,
        key: node.id,
        secondaryText: paths[node.id],
        onClick: () => {
          const path = paths[node.id];
          onSelectProperty(path);
        },
        data: {
          node,
          path: paths[node.id],
          level: 0,
        },
      })) as IContextualMenuItem[];
    }

    return [] as IContextualMenuItem[];
  }, [payload]);

  const menuItems = React.useMemo(getContextualMenuItems, [payload, propertyTreeExpanded]);

  const [items, setItems] = React.useState<IContextualMenuItem[]>([]);

  React.useEffect(() => setItems(menuItems), [menuItems]);

  const onSearchAbort = React.useCallback(() => {
    setQuery('');
  }, []);

  const onSearchQueryChange = React.useCallback((_?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    setQuery(newValue);
  }, []);

  const getFilterPredictable = React.useCallback((kind: ToolbarButtonPayload['kind'], q: string) => {
    switch (kind) {
      case 'functionRef':
      case 'templateRef':
        return (item: IContextualMenuItem) => item.text && item.text.toLowerCase().indexOf(q.toLowerCase()) !== -1;
      case 'propertyRef':
        return (item: IContextualMenuItem) =>
          item.data.node.children.length === 0 && item.secondaryText?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }
  }, []);

  React.useEffect(() => {
    if (debouncedQuery) {
      const searchableItems =
        payload.kind === 'functionRef'
          ? flatFunctionListItems
          : payload.kind === 'propertyRef'
          ? flatPropertyListItems
          : menuItems;

      const predictable = getFilterPredictable(payload.kind, debouncedQuery);

      const filteredItems = searchableItems.filter(predictable);

      if (!filteredItems || !filteredItems.length) {
        filteredItems.push({
          key: 'no_results',
          onRender: () => (
            <Stack
              key="no_results"
              horizontal
              horizontalAlign="center"
              styles={{ root: { height: 32 } }}
              tokens={{ childrenGap: 8 }}
              verticalAlign="center"
            >
              <Icon iconName="SearchIssue" title={uiStrings.emptyMessage} />
              <span>{uiStrings.emptyMessage}</span>
            </Stack>
          ),
        });
      }

      setItems(filteredItems);
    } else {
      setItems(menuItems);
    }
  }, [menuItems, flatPropertyListItems, flatFunctionListItems, debouncedQuery, payload.kind]);

  const onRenderMenuList = React.useCallback(
    (menuListProps?: IContextualMenuListProps, defaultRender?: IRenderFunction<IContextualMenuListProps>) => {
      return (
        <Stack>
          <Stack styles={headerContainerStyles} verticalAlign="center">
            <Header>{uiStrings.header}</Header>
          </Stack>
          <SearchBox
            disableAnimation
            placeholder={uiStrings.searchPlaceholder}
            styles={searchFieldStyles}
            onAbort={onSearchAbort}
            onChange={onSearchQueryChange}
          />
          <Stack styles={itemsContainerStyles}>{defaultRender?.(menuListProps)}</Stack>
        </Stack>
      );
    },
    [onSearchAbort, onSearchQueryChange, payload.kind, debouncedQuery]
  );

  const onDismiss = React.useCallback(() => {
    setQuery('');
    setPropertyTreeExpanded({});
  }, []);

  const menuProps: IContextualMenuProps = React.useMemo(() => {
    switch (payload.kind) {
      case 'templateRef': {
        return {
          onDismiss,
          items,
          calloutProps,
          onRenderMenuList,
          contextualMenuItemAs: (itemProps: IContextualMenuItemProps) => {
            return <TooltipItem text={`#${itemProps.item.text}`} tooltip={itemProps.item.secondaryText} />;
          },
        } as IContextualMenuProps;
      }
      case 'functionRef': {
        return {
          onDismiss,
          items,
          calloutProps,
          onRenderMenuList,
          contextualMenuItemAs: (itemProps: IContextualMenuItemProps) => {
            return itemProps.item.subMenuProps || itemProps.item.items ? (
              <ContextualMenuItem {...itemProps} />
            ) : (
              <TooltipItem
                text={itemProps.item.text}
                tooltip={buildInFunctionsMap.get(itemProps.item.key)?.Introduction}
              />
            );
          },
        } as IContextualMenuProps;
      }
      case 'propertyRef': {
        return {
          onDismiss,
          items,
          calloutProps,
          onRenderMenuList,
          contextualMenuItemAs: (itemProps: IContextualMenuItemProps) => {
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
                  {pathNodes.map((pn, idx) => (
                    <Text
                      key={`segment-${idx}`}
                      styles={{
                        root: { color: idx === pathNodes.length - 1 ? NeutralColors.black : NeutralColors.gray70 },
                      }}
                    >
                      {`${pn}${idx === pathNodes.length - 1 && node.children.length === 0 ? '' : '.'}`}
                    </Text>
                  ))}
                </Stack>
              );
            };

            const renderSearchResultLabel = () => (
              <Stack styles={labelContainerStyle} verticalAlign="center">
                <Text>{path}</Text>
              </Stack>
            );

            return (
              <PropertyTreeItem
                expanded={propertyTreeExpanded[node.id]}
                item={node}
                level={level}
                onRenderLabel={debouncedQuery ? renderSearchResultLabel : renderLabel}
                onToggleExpand={onToggleExpand}
              />
            );
          },
        } as IContextualMenuProps;
      }
    }
  }, [items, onRenderMenuList, onDismiss, propertyTreeExpanded, debouncedQuery]);

  return (
    <IconButton
      componentRef={buttonRef}
      disabled={disabled}
      iconProps={{ iconName: getIcon(payload.kind) }}
      menuProps={menuProps}
      styles={buttonStyles}
      onRenderMenuIcon={() => null}
    />
  );
});
