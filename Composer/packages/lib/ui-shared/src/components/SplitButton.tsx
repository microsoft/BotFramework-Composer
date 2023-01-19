// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { FluentTheme } from '@fluentui/theme';
import { DefaultButton, IButtonProps, IButtonStyles } from '@fluentui/react/lib/Button';
import { IRawStyle, mergeStyleSets } from '@fluentui/react/lib/Styling';
import { useMemo } from 'react';

interface SplitButtonProps
  extends Omit<
    IButtonProps,
    | 'split'
    | 'splitButtonMenuProps'
    | 'buttonType'
    | 'getSplitButtonClassNames'
    | 'renderPersistedMenuHiddenOnMount'
    | 'primaryActionButtonProps'
  > {
  splitButtonAriaLabel: string;
}

const SplitButtonContainer = styled.div`
  position: relative;
  display: inline-flex;

  label: split-button-container;
`;

const SplitButtonDivider = styled.span(
  ({ primary, disabled, styles }: { primary?: boolean; disabled?: boolean; styles?: Record<string, any> }) => [
    `
      position: absolute;
      width: 1px;
      right: 33px;
      top: 8px;
      bottom: 8px;
      background-color: ${
        disabled
          ? FluentTheme.semanticColors.disabledText
          : primary
          ? FluentTheme.palette.white
          : FluentTheme.palette.neutralPrimary
      };

      label: split-button-divider;
    `,
    styles,
  ]
);

const menuButtonStyles = {
  root: {
    minWidth: '0',
    width: '32px',
    marginLeft: '-2px',
    padding: '6px',
  },
  label: {
    display: 'none',
  },
};

/**
 * Accessible analog of the Fluent split button component.
 *
 * Fluent team won't fix a11y issues of the split button in the current version
 * as it introduces breaking changes.
 * For more details see: https://github.com/microsoft/fluentui/issues/21904.
 *
 * Unlike Fluent split button this component consists of two buttons. This allows to operate with buttons
 * independently and addresses issues with nested button controls not being accessible using screen readers.
 */
export const SplitButton: React.FC<SplitButtonProps> = ({
  primary,
  menuAs,
  menuIconProps,
  menuProps,
  menuTriggerKeyCode,
  contextMenu,
  onMenuClick,
  onAfterMenuDismiss,
  onContextMenu,
  onRenderMenuIcon,
  persistMenu,
  onContextMenuCapture,
  splitButtonAriaLabel,
  disabled,
  ...props
}) => {
  const splitButtonStyles = useMemo<IButtonStyles>(
    () =>
      mergeStyleSets(menuButtonStyles, {
        root: props.styles?.splitButtonMenuButton,
        icon: props.styles?.splitButtonMenuIcon,
      }),
    [props.styles]
  );
  const dividerStyles = props.styles?.splitButtonDivider as IRawStyle;
  return (
    <SplitButtonContainer>
      <DefaultButton disabled={disabled} primary={primary} {...props} />
      <DefaultButton
        aria-label={splitButtonAriaLabel}
        contextMenu={contextMenu}
        disabled={disabled}
        menuAs={menuAs}
        menuIconProps={menuIconProps}
        menuProps={menuProps}
        menuTriggerKeyCode={menuTriggerKeyCode}
        persistMenu={persistMenu}
        primary={primary}
        styles={splitButtonStyles}
        onAfterMenuDismiss={onAfterMenuDismiss}
        onContextMenu={onContextMenu}
        onContextMenuCapture={onContextMenuCapture}
        onMenuClick={onMenuClick}
        onRenderMenuIcon={onRenderMenuIcon}
      />
      <SplitButtonDivider disabled={disabled} primary={primary} styles={dividerStyles} />
    </SplitButtonContainer>
  );
};

SplitButton.displayName = 'SplitButton';
