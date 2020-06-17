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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useState } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { SelfHostContext } from '../../store/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';
import { ObiColors } from '../../constants/ElementColors';
import { IconMenu } from './IconMenu';
import { createActionMenu } from './createSchemaMenu';
export var EdgeMenu = function (_a) {
  var id = _a.id,
    forwardedRef = _a.forwardedRef,
    onClick = _a.onClick,
    rest = __rest(_a, ['id', 'forwardedRef', 'onClick']);
  var _b = useContext(NodeRendererContext),
    clipboardActions = _b.clipboardActions,
    customSchemas = _b.customSchemas;
  var selfHosted = useContext(SelfHostContext);
  var selectedIds = useContext(SelectionContext).selectedIds;
  var nodeSelected = selectedIds.includes('' + id + MenuTypes.EdgeMenu);
  var declareElementAttributes = function (id) {
    var _a;
    return (
      (_a = {}),
      (_a[AttrNames.SelectableElement] = true),
      (_a[AttrNames.EdgeMenuElement] = true),
      (_a[AttrNames.SelectedId] = '' + id + MenuTypes.EdgeMenu),
      _a
    );
  };
  var _c = useState(false),
    menuSelected = _c[0],
    setMenuSelected = _c[1];
  var boxShaow = '0px 2px 8px rgba(0, 0, 0, 0.1)';
  boxShaow += menuSelected ? ',0 0 0 2px ' + ObiColors.AzureBlue : nodeSelected ? ', 0 0 0 2px ' + ObiColors.Black : '';
  var handleMenuShow = function (menuSelected) {
    setMenuSelected(menuSelected);
  };
  var menuItems = createActionMenu(
    function (item) {
      if (!item) return;
      onClick(item.key);
    },
    {
      isSelfHosted: selfHosted,
      enablePaste: Array.isArray(clipboardActions) && !!clipboardActions.length,
    },
    // Custom Action 'oneOf' arrays from schema file
    customSchemas
      .map(function (x) {
        return x.oneOf;
      })
      .filter(function (oneOf) {
        return Array.isArray(oneOf) && oneOf.length;
      })
  );
  return jsx(
    'div',
    __assign(
      {
        ref: forwardedRef,
        className: classnames({ 'step-renderer-container--selected': nodeSelected }),
        style: {
          width: EdgeAddButtonSize.width,
          height: EdgeAddButtonSize.height,
          borderRadius: '8px',
          backdropFilter: 'white',
          boxShadow: boxShaow,
          overflow: 'hidden',
          background: 'white',
        },
      },
      declareElementAttributes(id)
    ),
    jsx(
      IconMenu,
      __assign(
        {
          handleMenuShow: handleMenuShow,
          iconName: 'Add',
          iconSize: 7,
          iconStyles: {
            color: '#005CE6',
            selectors: {
              ':focus': {
                outline: 'none',
                selectors: {
                  '::after': {
                    outline: 'none !important',
                  },
                },
              },
            },
          },
          label: formatMessage('Add'),
          menuItems: menuItems,
          nodeSelected: nodeSelected,
        },
        rest
      )
    )
  );
};
//# sourceMappingURL=EdgeMenu.js.map
