// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { buildInFunctionsMap, getBuiltInFunctionInsertText } from '@bfc/built-in-functions';
import styled from '@emotion/styled';
import { createSvgIcon } from '@fluentui/react-icons';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import {
  ContextualMenuItem,
  IContextualMenuItem,
  IContextualMenuItemProps,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';

import { useNoSearchResultMenuItem } from '../../hooks/useNoSearchResultMenuItem';
import { useSearchableMenuListCallback } from '../../hooks/useSearchableMenuListCallback';
import { computePropertyItemTree, getAllNodes } from '../../utils/fieldToolbarUtils';
import { withTooltip } from '../../utils/withTooltip';
import { jsLgToolbarMenuClassName } from '../../lg/constants';
import {
  FunctionRefPayload,
  PropertyItem,
  PropertyRefPayload,
  TemplateRefPayload,
  ToolbarButtonPayload,
} from '../../types';

import { PropertyTreeItem } from './PropertyTreeItem';

// no op operation
const noop = () => {};

const propertiesSvgIcon = (
  <svg height="16" viewBox="0 0 2048 2048" width="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M421 256v112q-47 1-76 18t-45 45-21 67-5 82q0 42 2 86t3 88q0 45-5 87t-20 77-42 62-72 41v4q39 11 65 33t43 52 22 65 7 73v253q0 40 5 73t21 56 44 37 74 15v110q-93-1-149-28t-85-71-38-102-9-119q0-45 2-88t2-86q0-45-5-84t-20-69-44-48-75-22V973q46-3 74-21t44-49 20-71 5-85q0-40-1-82t-2-85q0-62 8-120t38-103 85-72 150-29zm841 358h165l-313 452 308 442h-174q-57-90-113-178t-111-180h-4q-55 91-113 179t-116 179H619l318-439-304-455h174q56 94 111 186t108 189h4l232-375zm786 359v102q-47 3-75 21t-43 48-21 69-5 85q0 42 2 86t2 89q0 62-9 119t-38 101-84 71-149 28v-110q44-1 72-14t45-38 22-57 6-72v-253q0-37 6-72t22-65 42-52 66-34v-4q-45-13-72-39t-41-62-20-77-5-87q0-45 2-90t2-87q0-43-5-81t-21-67-44-45-77-18V256q93 1 148 28t85 72 38 103 9 120q0 43-2 85t-2 84q0 45 5 84t20 70 44 49 75 22z" />
  </svg>
);

const templateSvgIcon = (
  <svg height="16" viewBox="0 0 13 13" width="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.29846 5.10121H3.629V4.42105H4.29846V5.10121ZM6.9763 5.10121H6.30684V4.42105H6.9763V5.10121ZM9.65413 4.42105V5.78138H8.98467V7.48178C8.98467 7.62348 8.95852 7.75633 8.90622 7.88031C8.85392 8.0043 8.78244 8.11235 8.69178 8.20445C8.60113 8.29656 8.49478 8.36918 8.37274 8.42232C8.25071 8.47546 8.11995 8.50202 7.98048 8.50202H6.59973L4.29846 10.5V8.50202H2.62482C2.48535 8.50202 2.35459 8.47546 2.23256 8.42232C2.11052 8.36918 2.00417 8.29656 1.91352 8.20445C1.82286 8.11235 1.75138 8.0043 1.69908 7.88031C1.64678 7.75633 1.62063 7.62348 1.62063 7.48178V5.78138H0.951172V4.42105H1.62063V3.40081C1.62063 3.25911 1.64678 3.12627 1.69908 3.00228C1.75138 2.87829 1.82286 2.77024 1.91352 2.67814C2.00417 2.58603 2.11052 2.51341 2.23256 2.46027C2.35459 2.40714 2.48535 2.38057 2.62482 2.38057H4.96792V1.26999C4.86681 1.20977 4.78487 1.12652 4.7221 1.02024C4.66283 0.913968 4.63319 0.800607 4.63319 0.680162C4.63319 0.584514 4.65063 0.495951 4.68549 0.414474C4.72036 0.332996 4.76743 0.262146 4.82671 0.201923C4.88947 0.138158 4.96095 0.0885628 5.04114 0.0531377C5.12134 0.0177126 5.20851 0 5.30265 0C5.39679 0 5.48396 0.0177126 5.56416 0.0531377C5.64435 0.0885628 5.71409 0.138158 5.77336 0.201923C5.83612 0.262146 5.88494 0.332996 5.91981 0.414474C5.95467 0.495951 5.97211 0.584514 5.97211 0.680162C5.97211 0.800607 5.94073 0.913968 5.87797 1.02024C5.81869 1.12652 5.7385 1.20977 5.63738 1.26999V2.38057H7.98048C8.11995 2.38057 8.25071 2.40714 8.37274 2.46027C8.49478 2.51341 8.60113 2.58603 8.69178 2.67814C8.78244 2.77024 8.85392 2.87829 8.90622 3.00228C8.95852 3.12627 8.98467 3.25911 8.98467 3.40081V4.42105H9.65413ZM8.31521 3.40081C8.31521 3.3087 8.28209 3.229 8.21584 3.16169C8.14959 3.09438 8.07114 3.06073 7.98048 3.06073H2.62482C2.53416 3.06073 2.45571 3.09438 2.38946 3.16169C2.32321 3.229 2.29009 3.3087 2.29009 3.40081V7.48178C2.29009 7.57389 2.32321 7.65359 2.38946 7.7209C2.45571 7.78821 2.53416 7.82186 2.62482 7.82186H4.96792V9.02277L6.34868 7.82186H7.98048C8.07114 7.82186 8.14959 7.78821 8.21584 7.7209C8.28209 7.65359 8.31521 7.57389 8.31521 7.48178V3.40081ZM3.86436 5.85577C4.05613 6.05061 4.2758 6.20116 4.52336 6.30744C4.77092 6.41017 5.03068 6.46154 5.30265 6.46154C5.57462 6.46154 5.83438 6.41017 6.08194 6.30744C6.3295 6.20116 6.54917 6.05061 6.74094 5.85577L7.21165 6.33932C6.95712 6.59792 6.66423 6.79631 6.33299 6.93446C6.00523 7.07262 5.66179 7.1417 5.30265 7.1417C4.94351 7.1417 4.59832 7.07262 4.26708 6.93446C3.93933 6.79631 3.64818 6.59792 3.39365 6.33932L3.86436 5.85577Z" />
    <path d="M7.91344 5.25H12.2649V12.25H6.17285V7.875L7.91344 5.25Z" fill="transparent" />
    <path d="M10.9385 7.34619L10.8052 7.96143H10.1729L9.98486 8.80908H10.6924L10.5386 9.42432H9.8584L9.5918 10.6069H8.9082L9.15771 9.42432H8.375L8.12207 10.6069H7.43848L7.68115 9.42432H7.04541L7.17188 8.80908H7.81445L7.99561 7.96143H7.30518L7.42139 7.34619H8.12207L8.375 6.12939H9.07568L8.82275 7.34619H9.60547L9.86523 6.12939H10.5591L10.3062 7.34619H10.9385ZM9.48242 7.96143H8.68945L8.50146 8.80908H9.29102L9.48242 7.96143Z" />
  </svg>
);

const defaultTreeItemHeight = 36;

const buttonStyles = { menuIcon: { fontSize: 8, color: NeutralColors.black } };
const labelContainerStyle: IStackStyles = {
  root: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: defaultTreeItemHeight },
};

const headerContainerStyles = {
  root: { height: 32 },
};

const fontSizeStyle = {
  fontSize: FluentTheme.fonts.small.fontSize,
};

const Header = styled(Label)({
  padding: '0 8px',
  color: FluentTheme.palette.accent,
  ...fontSizeStyle,
});

const OneLiner = styled.div({
  ...fontSizeStyle,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '0 8px',
});

const svgIconStyle = { fill: NeutralColors.black, margin: '0 4px', width: 16, height: 16 };
const iconStyles = { root: { color: NeutralColors.black, margin: '0 4px', width: 16, height: 16 } };

type ToolbarButtonMenuProps = {
  payload: ToolbarButtonPayload;
  disabled?: boolean;

  // This className can be use for handling dismal of the toolbar in the container
  // due to the portal nature of this component
  dismissHandlerClassName?: string;
};

const getIcon = (kind: ToolbarButtonPayload['kind']): JSX.Element => {
  switch (kind) {
    case 'function':
      return <Icon iconName="Variable" styles={iconStyles} />;
    case 'property': {
      const PropertyIcon = createSvgIcon({ svg: () => propertiesSvgIcon, displayName: 'PropertyIcon' });
      return <PropertyIcon style={svgIconStyle} />;
    }
    case 'template': {
      const TemplateIcon = createSvgIcon({ svg: () => templateSvgIcon, displayName: 'TemplateIcon' });
      return <TemplateIcon style={svgIconStyle} />;
    }
  }
};

const getStrings = (kind: ToolbarButtonPayload['kind']) => {
  switch (kind) {
    case 'function':
      return {
        emptyMessage: formatMessage('No functions found'),
        searchPlaceholder: formatMessage('Search functions'),
        header: formatMessage('Insert prebuilt functions'),
      };
    case 'property':
      return {
        emptyMessage: formatMessage('No properties found'),
        searchPlaceholder: formatMessage('Search properties'),
        header: formatMessage('Insert property reference'),
      };
    case 'template':
      return {
        emptyMessage: formatMessage('No templates found'),
        searchPlaceholder: formatMessage('Search templates'),
        header: formatMessage('Insert template reference'),
      };
  }
};

const TooltipItem = React.memo(({ text, tooltip }: { text?: string; tooltip?: string }) => {
  const OneLinerTooltip = withTooltip({ content: tooltip, directionalHint: DirectionalHint.topRightEdge }, OneLiner);
  return <OneLinerTooltip>{text}</OneLinerTooltip>;
});

export const ToolbarButtonMenu = React.memo((props: ToolbarButtonMenuProps) => {
  const { payload, disabled = false, dismissHandlerClassName = jsLgToolbarMenuClassName } = props;

  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const uiStrings = React.useMemo(() => getStrings(payload.kind), [payload.kind]);

  const calloutProps = React.useMemo(
    () => ({
      styles: {
        calloutMain: { overflowY: 'hidden' },
      },
      layerProps: { className: dismissHandlerClassName },
    }),
    [dismissHandlerClassName]
  );

  const propertyTreeConfig = React.useMemo(() => {
    if (payload.kind === 'property') {
      const { properties, onSelectProperty } = (payload as PropertyRefPayload).data;
      return { root: computePropertyItemTree(properties), onSelectProperty };
    }

    return { root: { id: 'root', name: 'root', children: [] }, onSelectProperty: noop };
  }, [payload]);

  const getContextualMenuItems = (): IContextualMenuItem[] => {
    switch (payload.kind) {
      case 'template': {
        const { templates, onSelectTemplate } = (payload as TemplateRefPayload).data;
        return templates.map((t, i) => ({
          text: t.name,
          key: `${i}-${t.name}`,
          secondaryText: t.body,
          onClick: () => onSelectTemplate(`${t.name}(${t.parameters.join(', ')})`, 'template'),
        })) as IContextualMenuItem[];
      }
      case 'function': {
        const { functions, onSelectFunction } = (payload as FunctionRefPayload).data;
        return functions.map((grouping: { key: string; name: string; children: string[] }) => {
          return {
            key: grouping.key,
            text: grouping.name,
            style: fontSizeStyle,
            subMenuProps: {
              calloutProps: {
                calloutMaxHeight: 432,
                layerProps: { className: dismissHandlerClassName },
              },
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
                  onClick: () => onSelectFunction(getBuiltInFunctionInsertText(key), 'function'),
                };
              }),
            },
          };
        });
      }
      case 'property': {
        const { root, onSelectProperty } = propertyTreeConfig;
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
          onClick: (ev) => {
            if (node.children.length) {
              ev?.preventDefault();
              onToggleExpand(node.id, !propertyTreeExpanded[node.id]);
            } else {
              const path = paths[node.id];
              onSelectProperty(path, 'property');
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
    if (payload.kind === 'function') {
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
          onClick: () => onSelectFunction(getBuiltInFunctionInsertText(key), 'function'),
        })) as IContextualMenuItem[];
    }

    return [] as IContextualMenuItem[];
  }, [payload]);

  const flatPropertyListItems = React.useMemo(() => {
    if (payload.kind === 'property') {
      const { root, onSelectProperty } = propertyTreeConfig;
      const { nodes, paths } = getAllNodes<PropertyItem>(root, { skipRoot: true });

      return nodes.map((node) => ({
        text: node.id,
        key: node.id,
        secondaryText: paths[node.id],
        onClick: () => {
          const path = paths[node.id];
          onSelectProperty(path, 'property');
        },
        data: {
          node,
          path: paths[node.id],
          level: 0,
        },
      })) as IContextualMenuItem[];
    }

    return [] as IContextualMenuItem[];
  }, [payload, propertyTreeConfig]);

  const menuItems = React.useMemo(getContextualMenuItems, [payload, propertyTreeExpanded]);

  const [items, setItems] = React.useState<IContextualMenuItem[]>([]);

  React.useEffect(() => setItems(menuItems), [menuItems]);

  const getFilterPredicate = React.useCallback((kind: ToolbarButtonPayload['kind'], q: string) => {
    switch (kind) {
      case 'function':
      case 'template':
        return (item: IContextualMenuItem) => item.text && item.text.toLowerCase().indexOf(q.toLowerCase()) !== -1;
      case 'property':
        return (item: IContextualMenuItem) =>
          item.data.node.children.length === 0 && item.secondaryText?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }
  }, []);

  const noSearchResultMenuItem = useNoSearchResultMenuItem(uiStrings.emptyMessage);

  const menuHeaderRenderer = React.useCallback(
    () => (
      <Stack styles={headerContainerStyles} verticalAlign="center">
        <Header>{uiStrings.header}</Header>
      </Stack>
    ),
    []
  );

  const { onRenderMenuList, query, setQuery } = useSearchableMenuListCallback(
    uiStrings.searchPlaceholder,
    menuHeaderRenderer
  );

  React.useEffect(() => {
    if (query) {
      const searchableItems =
        payload.kind === 'function'
          ? flatFunctionListItems
          : payload.kind === 'property'
          ? flatPropertyListItems
          : menuItems;

      const predicate = getFilterPredicate(payload.kind, query);

      const filteredItems = searchableItems.filter(predicate);

      if (!filteredItems || !filteredItems.length) {
        filteredItems.push(noSearchResultMenuItem);
      }

      setItems(filteredItems);
    } else {
      setItems(menuItems);
    }
  }, [menuItems, flatPropertyListItems, flatFunctionListItems, noSearchResultMenuItem, query, payload.kind]);

  const onDismiss = React.useCallback(() => {
    setQuery('');
    setPropertyTreeExpanded({});
  }, []);

  const menuProps: IContextualMenuProps = React.useMemo(() => {
    switch (payload.kind) {
      case 'template': {
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
      case 'function': {
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
      case 'property': {
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
          },
        } as IContextualMenuProps;
      }
    }
  }, [items, calloutProps, onRenderMenuList, onDismiss, propertyTreeExpanded, query]);

  const renderIcon = React.useCallback(() => getIcon(payload.kind), [payload.kind]);

  return (
    <IconButton
      className={dismissHandlerClassName}
      data-testid="menuButton"
      disabled={disabled}
      menuProps={menuProps}
      styles={buttonStyles}
      onRenderIcon={renderIcon}
    />
  );
});
