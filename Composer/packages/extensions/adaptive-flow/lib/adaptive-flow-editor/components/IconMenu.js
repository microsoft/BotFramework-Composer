// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __rest } from "tslib";
import React, { useRef, useEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
export var IconMenu = function (_a) {
    var nodeSelected = _a.nodeSelected, iconName = _a.iconName, iconSize = _a.iconSize, iconStyles = _a.iconStyles, label = _a.label, menuItems = _a.menuItems, menuWidth = _a.menuWidth, handleMenuShow = _a.handleMenuShow, rest = __rest(_a, ["nodeSelected", "iconName", "iconSize", "iconStyles", "label", "menuItems", "menuWidth", "handleMenuShow"]);
    var onRenderItem = function (item) {
        return (React.createElement(Link, { styles: { root: { marginRight: 10 } }, onClick: item.onClick }, item.name));
    };
    var buttonRef = useRef(null);
    useEffect(function () {
        if (nodeSelected) {
            buttonRef.current && buttonRef.current.focus();
        }
    }, [nodeSelected]);
    var onRenderOverflowButton = function (overflowItems) {
        if (!overflowItems) {
            return null;
        }
        var _a = iconStyles || {
            background: undefined,
            color: undefined,
            selectors: undefined,
        }, background = _a.background, color = _a.color, selectors = _a.selectors;
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
        return (React.createElement(IconButton, __assign({ ariaLabel: label, componentRef: buttonRef, "data-testid": "iconMenu", menuIconProps: { iconName: iconName, style: { fontSize: iconSize, fontWeight: 'bold', color: color } }, menuProps: { items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } }, styles: buttonStyles, onAfterMenuDismiss: onAfterMenuDismiss, onMenuClick: onMenuClick }, rest)));
    };
    return (React.createElement(OverflowSet, { vertical: true, "aria-label": "icon menu", overflowItems: menuItems, onRenderItem: onRenderItem, onRenderOverflowButton: onRenderOverflowButton }));
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