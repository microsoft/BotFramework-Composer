// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useState } from 'react';
import formatMessage from 'format-message';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { useMenuConfig } from '@bfc/extension';
// TODO: leak of visual-sdk domain (EdgeAddButtonSize)
import { EdgeAddButtonSize } from '../../../adaptive-flow-renderer/constants/ElementSizes';
import { NodeRendererContext } from '../../contexts/NodeRendererContext';
import { SelectionContext } from '../../contexts/SelectionContext';
import { SelfHostContext } from '../../contexts/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';
import { ObiColors } from '../../../adaptive-flow-renderer/constants/ElementColors';
import { IconMenu } from '../../components/IconMenu';
import { createActionMenu } from './createSchemaMenu';
export var EdgeMenu = function (_a) {
  var id = _a.id,
    onClick = _a.onClick;
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
  var boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.1)';
  boxShadow += menuSelected
    ? ',0 0 0 2px ' + ObiColors.AzureBlue
    : nodeSelected
    ? ', 0 0 0 2px ' + ObiColors.Black
    : '';
  var handleMenuShow = function (menuSelected) {
    setMenuSelected(menuSelected);
  };
  var menuSchema = useMenuConfig();
  var menuItems = createActionMenu(
    function (item) {
      if (!item) return;
      onClick(item.key);
    },
    {
      isSelfHosted: selfHosted,
      enablePaste: Array.isArray(clipboardActions) && !!clipboardActions.length,
    },
    menuSchema,
    // Custom Action 'oneOf' arrays from schema file
    customSchemas
      .map(function (x) {
        return x.oneOf;
      })
      .filter(function (oneOf) {
        return Array.isArray(oneOf) && oneOf.length;
      })
  );
  var moreLabel = formatMessage('Add');
  return jsx(
    'div',
    __assign(
      {
        style: {
          width: EdgeAddButtonSize.width,
          height: EdgeAddButtonSize.height,
          borderRadius: '8px',
          backdropFilter: 'white',
          boxShadow: boxShadow,
          overflow: 'hidden',
          background: 'white',
        },
      },
      declareElementAttributes(id)
    ),
    jsx(
      TooltipHost,
      { content: moreLabel, directionalHint: DirectionalHint.rightCenter },
      jsx(IconMenu, {
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
        label: moreLabel,
        menuItems: menuItems,
        nodeSelected: nodeSelected,
      })
    )
  );
};
//# sourceMappingURL=EdgeMenu.js.map
