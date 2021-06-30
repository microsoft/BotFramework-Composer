// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useEffect } from 'react';
import { IconButton, IButtonStyles, IButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { ICalloutProps } from 'office-ui-fabric-react/lib/Callout';

interface IconMenuProps {
  autoFocus?: boolean;
  dataTestId?: string;
  iconName: string;
  iconSize?: number;
  iconStyles?: {
    background?: string;
    color?: string;
    selectors?: { [key: string]: any };
  };
  label?: string;
  menuItems: IContextualMenuItem[];
  menuWidth?: number;
  calloutProps?: ICalloutProps;
  handleMenuShow?: (menuShowed: boolean) => void;
}

export const IconMenu: React.FC<IconMenuProps> = ({
  autoFocus,
  iconName,
  iconSize,
  iconStyles,
  label,
  menuItems,
  menuWidth,
  handleMenuShow,
  calloutProps,
  ...rest
}): JSX.Element => {
  const onRenderItem = (item): React.ReactNode => {
    return (
      <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  };

  const buttonRef = useRef<IButton | null>(null);

  useEffect(() => {
    if (autoFocus) {
      buttonRef.current && buttonRef.current.focus();
    }
  }, [autoFocus]);

  const onRenderOverflowButton: IRenderFunction<IContextualMenuItem[]> = (overflowItems) => {
    if (!overflowItems) {
      return null;
    }

    const { background, color, selectors } = iconStyles || {
      background: undefined,
      color: undefined,
      selectors: undefined,
    };

    const buttonStyles: IButtonStyles = {
      root: {
        minWidth: 0,
        padding: 0,
        margin: 0,
        alignSelf: 'stretch',
        height: 'auto',
        color: '#323130',
        background: background || 'transparent',
        selectors,
      },
      rootHovered: {
        background: background || 'transparent',
      },
      rootChecked: {
        background: background || 'transparent',
      },
    };

    const onMenuClick = () => {
      handleMenuShow?.(true);
    };
    const onAfterMenuDismiss = () => {
      handleMenuShow?.(false);
    };
    return (
      <IconButton
        ariaLabel={label}
        componentRef={buttonRef}
        data-testid="iconMenu"
        menuIconProps={{ iconName, style: { fontSize: iconSize, fontWeight: 'bold', color } }}
        menuProps={{ items: overflowItems, calloutProps: { ...calloutProps, calloutMaxWidth: menuWidth } }}
        styles={buttonStyles}
        onAfterMenuDismiss={onAfterMenuDismiss}
        onMenuClick={onMenuClick}
        {...rest}
      />
    );
  };

  return (
    <OverflowSet
      vertical
      aria-label="icon menu"
      overflowItems={menuItems}
      onRenderItem={onRenderItem}
      onRenderOverflowButton={onRenderOverflowButton}
    />
  );
};

IconMenu.defaultProps = {
  iconName: 'More',
  iconSize: 16,
  iconStyles: {},
  menuItems: [],
  menuWidth: 0,
  autoFocus: false,
};
