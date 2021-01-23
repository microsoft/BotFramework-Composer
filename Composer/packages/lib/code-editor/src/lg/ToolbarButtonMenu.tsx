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
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { PropertyTree } from './PropertyTree';
import {
  ToolbarButtonPayload,
  TemplateRefPayload,
  FunctionRefPayload,
  PropertyRefPayload,
  PropertyItem,
} from './types';
import { useDebounce } from './useDebounce';
import { computePropertyItemTree } from './utils';

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
  const { payload } = props;

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

        return [
          {
            key: 'root',
            text: 'root',
            data: {
              root,
              onSelectProperty: (property: string) => {
                buttonRef.current?.dismissMenu();
                onSelectProperty(property);
              },
            },
          },
        ];
      }
    }
  };

  const flatListItems = React.useMemo(() => {
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

  const menuItems = React.useMemo(getContextualMenuItems, [payload]);

  const [items, setItems] = React.useState<IContextualMenuItem[]>([]);

  React.useEffect(() => setItems(menuItems), [menuItems]);

  const onSearchAbort = React.useCallback(() => {
    setQuery('');
  }, []);

  const onSearchQueryChange = React.useCallback((_?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    setQuery(newValue);
  }, []);

  React.useEffect(() => {
    if (payload.kind !== 'propertyRef') {
      if (debouncedQuery) {
        const searchableItems = payload.kind === 'functionRef' ? flatListItems : menuItems;
        const filteredItems = searchableItems.filter(
          (item) => item.text && item.text.toLowerCase().indexOf(debouncedQuery.toLowerCase()) !== -1
        );

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
    }
  }, [menuItems, debouncedQuery, payload.kind]);

  const renderPropertyTree = React.useCallback(
    (menuListProps?: IContextualMenuListProps) => {
      if (menuListProps) {
        const { items } = menuListProps;
        if (items[0]?.data) {
          const { root, onSelectProperty } = items[0]?.data as {
            root: PropertyItem;
            onSelectProperty: (property: string) => void;
          };

          return (
            <PropertyTree
              emptyMessage={uiStrings.emptyMessage}
              root={root}
              searchQuery={debouncedQuery}
              onSelectProperty={onSelectProperty}
            />
          );
        }
        return null;
      }
    },
    [debouncedQuery]
  );

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
          <Stack styles={itemsContainerStyles}>
            {payload.kind !== 'propertyRef' ? defaultRender?.(menuListProps) : renderPropertyTree(menuListProps)}
          </Stack>
        </Stack>
      );
    },
    [onSearchAbort, onSearchQueryChange, payload.kind, debouncedQuery]
  );

  const onDismiss = React.useCallback(() => {
    setQuery('');
  }, [setQuery]);

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
          items,
          calloutProps,
          onRenderMenuList,
        };
      }
    }
  }, [items, onRenderMenuList]);

  return (
    <IconButton
      componentRef={buttonRef}
      iconProps={{ iconName: getIcon(payload.kind) }}
      menuProps={menuProps}
      styles={buttonStyles}
      onRenderMenuIcon={() => null}
    />
  );
});
