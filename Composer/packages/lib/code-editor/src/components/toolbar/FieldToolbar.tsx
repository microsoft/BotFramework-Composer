// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { VerticalDivider } from 'office-ui-fabric-react/lib/Divider';
import * as React from 'react';

import { useEditorToolbarItems } from '../../hooks/useEditorToolbarItems';
import { defaultMenuHeight, jsLgToolbarMenuClassName } from '../../lg/constants';
import { ToolbarButtonPayload } from '../../types';
import { withTooltip } from '../../utils/withTooltip';

import { ToolbarButtonMenu } from './ToolbarButtonMenu';

const dividerStyles = {
  divider: {
    height: 'calc(100% - 12px)',
  },
};

const moreButtonStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    height: defaultMenuHeight,
  },
  menuIcon: { fontSize: 8, color: NeutralColors.black },
};

const commandBarStyles = {
  root: {
    height: defaultMenuHeight,
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

export type FieldToolbarProps = {
  onSelectToolbarMenuItem: (itemText: string, itemType: ToolbarButtonPayload['kind']) => void;
  excludedToolbarItems?: ToolbarButtonPayload['kind'][];
  lgTemplates?: readonly LgTemplate[];
  properties?: readonly string[];
  moreToolbarItems?: ICommandBarItemProps[];
  farItems?: ICommandBarItemProps[];
  className?: string;
  dismissHandlerClassName?: string;
};

export const FieldToolbar = React.memo((props: FieldToolbarProps) => {
  const {
    className,
    excludedToolbarItems,
    properties,
    lgTemplates,
    moreToolbarItems,
    farItems,
    dismissHandlerClassName = jsLgToolbarMenuClassName,
    onSelectToolbarMenuItem,
  } = props;

  const { functionRefPayload, propertyRefPayload, templateRefPayload } = useEditorToolbarItems(
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

  const fixedItems: ICommandBarItemProps[] = React.useMemo(() => {
    const items = [
      {
        key: 'template',
        disabled: !templateRefPayload?.data?.templates?.length,
        commandBarButtonAs: () => (
          <TooltipTemplateButton
            key="template"
            disabled={!templateRefPayload?.data?.templates?.length}
            dismissHandlerClassName={dismissHandlerClassName}
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
            dismissHandlerClassName={dismissHandlerClassName}
            payload={propertyRefPayload}
          />
        ),
      },
      {
        key: 'function',
        commandBarButtonAs: () => (
          <TooltipFunctionButton
            key="function"
            dismissHandlerClassName={dismissHandlerClassName}
            payload={functionRefPayload}
          />
        ),
      },
    ];

    return items.filter(({ key }) => !excludedToolbarItems?.includes(key as ToolbarButtonPayload['kind']));
  }, [
    TooltipTemplateButton,
    TooltipPropertyButton,
    TooltipFunctionButton,
    templateRefPayload,
    propertyRefPayload,
    functionRefPayload,
    excludedToolbarItems,
    dismissHandlerClassName,
  ]);

  const moreItems = React.useMemo(
    () =>
      moreToolbarItems?.map<ICommandBarItemProps>((itemProps) => ({
        ...itemProps,
        subMenuProps: configureMenuProps(itemProps.subMenuProps, dismissHandlerClassName),
        buttonStyles: moreButtonStyles,
        className: dismissHandlerClassName,
      })) ?? [],
    [moreToolbarItems, dismissHandlerClassName]
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
