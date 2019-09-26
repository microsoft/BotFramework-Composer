import React, { useRef, useEffect } from 'react';
import {
  OverflowSet,
  IconButton,
  Link,
  IRenderFunction,
  IContextualMenuItem,
  IButtonStyles,
  IButton,
  createRef,
} from 'office-ui-fabric-react';

interface IconMenuProps {
  nodeSelected?: boolean;
  dataTestId?: string;
  iconName: string;
  iconSize?: number;
  iconStyles?: object;
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
      <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  };

  const buttonRef = createRef<IButton>();

  useEffect((): void => {
    if (nodeSelected) {
      buttonRef.current && buttonRef.current.focus();
    }
  }, [nodeSelected]);
  const _onRenderOverflowButton: IRenderFunction<IContextualMenuItem[]> = overflowItems => {
    if (!overflowItems) {
      return null;
    }

    const buttonStyles: IButtonStyles = {
      root: {
        minWidth: 0,
        padding: '0 4px',
        alignSelf: 'stretch',
        height: 'auto',
        color: '#000000',
        ...iconStyles,
      },
    };

    return (
      <IconButton
        componentRef={buttonRef}
        data-testid="iconMenu"
        styles={buttonStyles}
        menuIconProps={{ iconName, style: { fontSize: iconSize } }}
        menuProps={{ items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } }}
        ariaLabel={label}
        {...rest}
      />
    );
  };

  return (
    <OverflowSet
      // @ts-ignore
      styles={{ position: 'absolute', top: 0 }}
      vertical
      overflowItems={menuItems}
      onRenderOverflowButton={_onRenderOverflowButton}
      onRenderItem={_onRenderItem}
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
