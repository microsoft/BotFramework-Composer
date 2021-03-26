// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { VerticalDivider } from 'office-ui-fabric-react/lib/Divider';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import * as React from 'react';
import { createSvgIcon } from '@fluentui/react-icons';

import { withTooltip } from '../utils/withTooltip';

import { jsLgToolbarMenuClassName } from './constants';
import { useLgEditorToolbarItems } from './hooks/useLgEditorToolbarItems';
import { ToolbarButtonMenu } from './ToolbarButtonMenu';
import { ToolbarButtonPayload } from './types';

const svgIconStyle = { fill: NeutralColors.black, margin: '0 4px', width: 16, height: 16 };

const popExpandSvgIcon = (
  <svg fill="none" height="16" viewBox="0 0 10 10" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.75 8.75V5.625H9.375V9.375H0.625V0.625H4.375V1.25H1.25V8.75H8.75ZM5.625 0.625H9.375V4.375H8.75V1.69434L5.21973 5.21973L4.78027 4.78027L8.30566 1.25H5.625V0.625Z"
      fill="black"
    />
  </svg>
);

const menuHeight = 32;

const dividerStyles = {
  divider: {
    height: 'calc(100% - 12px)',
  },
};

const moreButtonStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    height: menuHeight,
  },
  menuIcon: { fontSize: 8, color: NeutralColors.black },
};

const commandBarStyles = {
  root: {
    height: menuHeight,
    padding: 0,
    fontSize: FluentTheme.fonts.small.fontSize,
  },
};

const join = (...strings: (string | undefined)[]) => strings.filter(Boolean).join(' ');

const configureMenuProps = (props: IContextualMenuProps | undefined, className: string) => {
  if (!props) {
    return;
  }

  props.calloutProps = {
    ...props.calloutProps,
    layerProps: {
      ...props.calloutProps?.layerProps,
      className: join(props.calloutProps?.layerProps?.className, className),
    },
  };

  for (const item of props.items) {
    configureMenuProps(item.subMenuProps, className);
  }

  return props;
};

export type LgEditorToolbarProps = {
  lgTemplates?: readonly LgTemplate[];
  properties?: readonly string[];
  onSelectToolbarMenuItem: (itemText: string, itemType: ToolbarButtonPayload['kind']) => void;
  moreToolbarItems?: readonly ICommandBarItemProps[];
  className?: string;
  onPopExpand?: () => void;
};

export const LgEditorToolbar = React.memo((props: LgEditorToolbarProps) => {
  const { className, properties, lgTemplates, moreToolbarItems, onSelectToolbarMenuItem, onPopExpand } = props;

  const { functionRefPayload, propertyRefPayload, templateRefPayload } = useLgEditorToolbarItems(
    lgTemplates ?? [],
    properties ?? [],
    onSelectToolbarMenuItem
  );

  const TooltipTemplateButton = React.useMemo(
    () => withTooltip({ content: formatMessage('Insert a template reference') }, ToolbarButtonMenu),
    []
  );
  const TooltipPropertyButton = React.useMemo(
    () => withTooltip({ content: formatMessage('Insert a property reference in memory') }, ToolbarButtonMenu),
    []
  );
  const TooltipFunctionButton = React.useMemo(
    () =>
      withTooltip({ content: formatMessage('Insert an adaptive expression pre-built function') }, ToolbarButtonMenu),
    []
  );

  const fixedItems: ICommandBarItemProps[] = React.useMemo(
    () => [
      {
        key: 'template',
        disabled: !templateRefPayload?.data?.templates?.length,
        commandBarButtonAs: () => (
          <TooltipTemplateButton
            key="template"
            disabled={!templateRefPayload?.data?.templates?.length}
            payload={templateRefPayload}
          />
        ),
      },
      {
        key: 'property',
        disabled: !propertyRefPayload?.data?.properties?.length,
        commandBarButtonAs: () => (
          <TooltipPropertyButton
            key="property"
            disabled={!propertyRefPayload?.data?.properties?.length}
            payload={propertyRefPayload}
          />
        ),
      },
      {
        key: 'function',
        commandBarButtonAs: () => <TooltipFunctionButton key="function" payload={functionRefPayload} />,
      },
    ],
    [
      TooltipTemplateButton,
      TooltipPropertyButton,
      TooltipFunctionButton,
      templateRefPayload,
      propertyRefPayload,
      functionRefPayload,
    ]
  );

  const moreItems = React.useMemo(
    () =>
      moreToolbarItems?.map<ICommandBarItemProps>((itemProps) => ({
        ...itemProps,
        subMenuProps: configureMenuProps(itemProps.subMenuProps, jsLgToolbarMenuClassName),
        buttonStyles: moreButtonStyles,
        className: jsLgToolbarMenuClassName,
      })) ?? [],
    [moreToolbarItems]
  );

  const items = React.useMemo(
    () => [
      ...fixedItems,
      ...(moreItems.length
        ? [{ key: 'divider', commandBarButtonAs: () => <VerticalDivider styles={dividerStyles} /> }]
        : []),
      ...moreItems,
    ],
    [fixedItems, moreItems]
  );

  const popExpand = React.useCallback(() => {
    onPopExpand?.();
  }, [onPopExpand]);

  const farItems = React.useMemo<ICommandBarItemProps[]>(
    () =>
      onPopExpand
        ? [
            {
              key: 'popExpandButton',
              buttonStyles: moreButtonStyles,
              className: jsLgToolbarMenuClassName,
              onRenderIcon: () => {
                let PopExpandIcon = createSvgIcon({ svg: () => popExpandSvgIcon, displayName: 'PopExpandIcon' });
                PopExpandIcon = withTooltip({ content: formatMessage('Pop out editor') }, PopExpandIcon);
                return <PopExpandIcon style={svgIconStyle} />;
              },
              onClick: popExpand,
            },
          ]
        : [],
    [popExpand]
  );

  return (
    <CommandBar
      className={className}
      farItems={farItems}
      items={items}
      styles={commandBarStyles}
      onReduceData={() => undefined}
    />
  );
});
