// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useEffect } from 'react';
import { IconButton, IButtonStyles, IButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

interface IconMenuProps {
  nodeSelected?: boolean;
  dataTestId?: string;
  iconName: string;
  iconSize?: number;
  iconStyles?: {
    background?: string;
    color?: string;
    selectors?: { [key: string]: any };
  };
  label?: string;
  menuItems: any[];
  menuWidth?: number;
}

export const IconMenu: React.FC<IconMenuProps> = ({
  nodeSelected,
  iconName,
  iconSize,
  iconStyles,
  label,
  menuItems,
  menuWidth,
  ...rest
}): JSX.Element => {
  const _onRenderItem = (item): React.ReactNode => {
    return (
      <Link onClick={item.onClick} styles={{ root: { marginRight: 10 } }}>
        {item.name}
      </Link>
    );
  };

  const buttonRef = useRef<IButton>();

  useEffect((): void => {
    if (nodeSelected) {
      buttonRef.current && buttonRef.current.focus();
    }
  }, [nodeSelected]);
  const _onRenderOverflowButton: IRenderFunction<IContextualMenuItem[]> = (overflowItems) => {
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

    return (
      <IconButton
        // @ts-ignore
        ariaLabel={label}
        componentRef={buttonRef}
        data-testid="iconMenu"
        menuIconProps={{ iconName, style: { fontSize: iconSize, fontWeight: 'bold', color } }}
        menuProps={{ items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } }}
        styles={buttonStyles}
        {...rest}
      />
    );
  };

  return (
    <OverflowSet
      // @ts-ignore
      aria-label="icon menu"
      onRenderItem={_onRenderItem}
      onRenderOverflowButton={_onRenderOverflowButton}
      overflowItems={menuItems}
      styles={{ position: 'absolute', top: 0 }}
      vertical
    />
  );
};

IconMenu.defaultProps = {
  iconName: 'More',
  iconSize: 16,
  iconStyles: {},
  menuItems: [],
  menuWidth: 0,
  nodeSelected: false,
};
