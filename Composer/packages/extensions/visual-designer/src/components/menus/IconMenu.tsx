/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useRef, useEffect } from 'react';
import {
  OverflowSet,
  IconButton,
  Link,
  IRenderFunction,
  IContextualMenuItem,
  IButtonStyles,
  IButton,
} from 'office-ui-fabric-react';

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
      <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
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
  const _onRenderOverflowButton: IRenderFunction<IContextualMenuItem[]> = overflowItems => {
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
        padding: '0 4px',
        margin: 0,
        alignSelf: 'stretch',
        height: 'auto',
        color: '#000000',
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
        componentRef={buttonRef}
        data-testid="iconMenu"
        styles={buttonStyles}
        menuIconProps={{ iconName, style: { fontSize: iconSize, color } }}
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
