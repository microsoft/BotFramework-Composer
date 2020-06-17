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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { MenuTypes } from '../../constants/MenuTypes';
import { AttrNames } from '../../constants/ElementAttributes';
import { SelectionContext } from '../../store/SelectionContext';
import { IconMenu } from './IconMenu';
var declareElementAttributes = function (id) {
  var _a;
  return (
    (_a = {}), (_a[AttrNames.SelectableElement] = true), (_a[AttrNames.SelectedId] = '' + id + MenuTypes.NodeMenu), _a
  );
};
export var NodeMenu = function (_a) {
  var _b = _a.colors,
    colors = _b === void 0 ? { color: 'black' } : _b,
    id = _a.id,
    onEvent = _a.onEvent;
  var menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: function () {
        return onEvent(NodeEventTypes.Delete, { id: id });
      },
    },
  ];
  var selectedIds = useContext(SelectionContext).selectedIds;
  var nodeSelected = selectedIds.includes('' + id + MenuTypes.NodeMenu);
  return jsx(
    'div',
    __assign(
      {
        className: classnames({ 'step-renderer-container--selected': nodeSelected }),
        css: {
          marginRight: '1px',
        },
      },
      declareElementAttributes(id)
    ),
    jsx(IconMenu, {
      iconName: 'MoreVertical',
      iconSize: 12,
      iconStyles: {
        color: '' + colors.color,
        selectors: {
          ':focus': {
            outline: 'none',
            selectors: {
              '::after': {
                outline: '1px solid #0078d4 !important',
              },
            },
          },
        },
      },
      label: formatMessage('node menu'),
      menuItems: menuItems,
      menuWidth: 100,
      nodeSelected: nodeSelected,
    })
  );
};
//# sourceMappingURL=NodeMenu.js.map
