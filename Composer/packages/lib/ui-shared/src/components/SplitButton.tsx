// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { FluentTheme } from '@fluentui/theme';
import { DefaultButton, IButtonProps } from '@fluentui/react/lib/Button';

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

const SplitButtonDelimiter = styled.span(
  ({ primary, disabled }: { primary?: boolean; disabled?: boolean }) => `
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

  label: split-button-delimiter;
`
);

const menuButtonStyles = {
  root: {
    minWidth: '32px',
    width: '32px',
    marginLeft: '-2px',
  },
  label: {
    display: 'none',
  },
};

/**
 * Accessible analog of the Fluent split button component.
 *
 * Fluent team doesn't have plans to fix a11y issues of the split button in the current version
 * as it'd introduce breaking changes.
 * For more details see: https://github.com/microsoft/fluentui/issues/21904.
 *
 * The component intended to mimic Fluent Button API, so it's easier to switch back when accessibility
 * concerns are addressed in Fluent.
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
}) => (
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
      styles={menuButtonStyles}
      onAfterMenuDismiss={onAfterMenuDismiss}
      onContextMenu={onContextMenu}
      onContextMenuCapture={onContextMenuCapture}
      onMenuClick={onMenuClick}
      onRenderMenuIcon={onRenderMenuIcon}
    />
    <SplitButtonDelimiter disabled={disabled} primary={primary} />
  </SplitButtonContainer>
);

SplitButton.displayName = 'SplitButton';
