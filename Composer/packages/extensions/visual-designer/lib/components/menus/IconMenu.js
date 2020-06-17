// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React, { useRef, useEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
export var IconMenu = function (_a) {
  var nodeSelected = _a.nodeSelected,
    iconName = _a.iconName,
    iconSize = _a.iconSize,
    iconStyles = _a.iconStyles,
    label = _a.label,
    menuItems = _a.menuItems,
    menuWidth = _a.menuWidth,
    handleMenuShow = _a.handleMenuShow,
    rest = __rest(_a, [
      'nodeSelected',
      'iconName',
      'iconSize',
      'iconStyles',
      'label',
      'menuItems',
      'menuWidth',
      'handleMenuShow',
    ]);
  var _onRenderItem = function (item) {
    return React.createElement(Link, { styles: { root: { marginRight: 10 } }, onClick: item.onClick }, item.name);
  };
  var buttonRef = useRef(null);
  useEffect(
    function () {
      if (nodeSelected) {
        buttonRef.current && buttonRef.current.focus();
      }
    },
    [nodeSelected]
  );
  var _onRenderOverflowButton = function (overflowItems) {
    if (!overflowItems) {
      return null;
    }
    var _a = iconStyles || {
        background: undefined,
        color: undefined,
        selectors: undefined,
      },
      background = _a.background,
      color = _a.color,
      selectors = _a.selectors;
    var buttonStyles = {
      root: {
        minWidth: 0,
        padding: 0,
        margin: 0,
        alignSelf: 'stretch',
        height: 'auto',
        color: '#323130',
        background: background || 'transparent',
        selectors: selectors,
      },
      rootHovered: {
        background: background || 'transparent',
      },
      rootChecked: {
        background: background || 'transparent',
      },
    };
    var onMenuClick = function () {
      handleMenuShow && handleMenuShow(true);
    };
    var onAfterMenuDismiss = function () {
      handleMenuShow && handleMenuShow(false);
    };
    return React.createElement(
      IconButton,
      __assign(
        {
          ariaLabel: label,
          componentRef: buttonRef,
          'data-testid': 'iconMenu',
          menuIconProps: { iconName: iconName, style: { fontSize: iconSize, fontWeight: 'bold', color: color } },
          menuProps: { items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } },
          styles: buttonStyles,
          onAfterMenuDismiss: onAfterMenuDismiss,
          onMenuClick: onMenuClick,
        },
        rest
      )
    );
  };
  return React.createElement(OverflowSet, {
    vertical: true,
    'aria-label': 'icon menu',
    overflowItems: menuItems,
    onRenderItem: _onRenderItem,
    onRenderOverflowButton: _onRenderOverflowButton,
  });
};
IconMenu.defaultProps = {
  iconName: 'More',
  iconSize: 16,
  iconStyles: {},
  menuItems: [],
  menuWidth: 0,
  nodeSelected: false,
};
//# sourceMappingURL=IconMenu.js.map
