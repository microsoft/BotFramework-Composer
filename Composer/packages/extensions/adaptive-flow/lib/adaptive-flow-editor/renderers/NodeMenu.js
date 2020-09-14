// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from "tslib";
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { MenuTypes } from '../constants/MenuTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { SelectionContext } from '../contexts/SelectionContext';
import { IconMenu } from '../components/IconMenu';
var declareElementAttributes = function (id) {
    var _a;
    return _a = {},
        _a[AttrNames.SelectableElement] = true,
        _a[AttrNames.SelectedId] = "" + id + MenuTypes.NodeMenu,
        _a;
};
export var NodeMenu = function (_a) {
    var _b = _a.colors, colors = _b === void 0 ? { color: 'black' } : _b, id = _a.id, onEvent = _a.onEvent;
    var menuItems = [
        {
            key: 'delete',
            name: formatMessage('Delete'),
            iconProps: {
                iconName: 'Delete',
            },
            onClick: function () { return onEvent(NodeEventTypes.Delete, { id: id }); },
        },
    ];
    var selectedIds = useContext(SelectionContext).selectedIds;
    var nodeSelected = selectedIds.includes("" + id + MenuTypes.NodeMenu);
    var moreLabel = formatMessage('Node menu');
    return (jsx("div", __assign({ css: {
            marginRight: '1px',
        } }, declareElementAttributes(id)),
        jsx(TooltipHost, { content: moreLabel },
            jsx(IconMenu, { iconName: "MoreVertical", iconSize: 12, iconStyles: {
                    color: "" + colors.color,
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
                }, label: moreLabel, menuItems: menuItems, menuWidth: 100, nodeSelected: nodeSelected }))));
};
//# sourceMappingURL=NodeMenu.js.map