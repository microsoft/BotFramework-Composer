// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { VerticalDivider } from 'office-ui-fabric-react/lib/Divider';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import * as React from 'react';

import { withTooltip } from '../utils/withTooltip';

import { jsLgToolbarMenuClassName } from './constants';
import { useLgEditorToolbarItems } from './hooks/useLgEditorToolbarItems';
import { ToolbarButtonMenu } from './ToolbarButtonMenu';
import { ToolbarButtonPayload } from './types';

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
};

export const LgEditorToolbar = React.memo((props: LgEditorToolbarProps) => {
  const { className, properties, lgTemplates, moreToolbarItems, onSelectToolbarMenuItem } = props;

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

  return <CommandBar className={className} items={items} styles={commandBarStyles} onReduceData={() => undefined} />;
});
