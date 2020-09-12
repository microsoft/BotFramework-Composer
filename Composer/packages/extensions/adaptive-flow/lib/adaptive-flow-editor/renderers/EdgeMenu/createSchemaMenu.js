// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __makeTemplateObject, __spreadArrays } from "tslib";
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { ContextualMenuItemType, } from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { SDKKinds } from '@bfc/shared';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import set from 'lodash/set';
import { MenuEventTypes } from '../../constants/MenuTypes';
import { menuOrderMap } from './defaultMenuOrder';
var createBaseActionMenu = function (menuSchema, onClick, filter) {
    var _a;
    var menuTree = Object.entries(menuSchema).reduce(function (result, _a) {
        var $kind = _a[0], options = _a[1];
        if (filter && !filter($kind))
            return result;
        var optionList = Array.isArray(options) ? options : options ? [options] : [];
        optionList.map(function (opt) {
            // use $kind as fallback label
            var label = opt.label || $kind;
            var submenu = opt.submenu;
            if (submenu === false) {
                result[label] = $kind;
            }
            else if (Array.isArray(submenu)) {
                set(result, __spreadArrays(submenu, [label]), $kind);
            }
        });
        return result;
    }, {});
    var buildMenuItemFromMenuTree = function (labelName, labelData) {
        if (typeof labelData === 'string') {
            var $kind = labelData;
            return {
                key: $kind,
                name: labelName || $kind,
                onClick: function (e, itemData) { return onClick(itemData); },
            };
        }
        else {
            var subMenuItems = Object.keys(labelData)
                .sort(function (label1, label2) {
                var _a, _b;
                var order1 = (_a = menuOrderMap[label1]) !== null && _a !== void 0 ? _a : Number.MAX_VALUE;
                var order2 = (_b = menuOrderMap[label2]) !== null && _b !== void 0 ? _b : Number.MAX_VALUE;
                return order1 - order2;
            })
                .map(function (sublabelName) { return buildMenuItemFromMenuTree(sublabelName, labelData[sublabelName]); });
            return createSubMenu(labelName, onClick, subMenuItems);
        }
    };
    var stepMenuItems = ((_a = buildMenuItemFromMenuTree('root', menuTree).subMenuProps) === null || _a === void 0 ? void 0 : _a.items) || [];
    return stepMenuItems;
};
var createDivider = function () { return ({
    key: 'divider',
    itemType: ContextualMenuItemType.Divider,
}); };
var get$kindFrom$ref = function ($ref) {
    return $ref.replace('#/definitions/', '');
};
var createCustomActionSubMenu = function (customizedActionGroups, onClick, filter) {
    if (!Array.isArray(customizedActionGroups) || customizedActionGroups.length === 0) {
        return [];
    }
    var itemGroups = customizedActionGroups
        .filter(function (actionGroup) { return Array.isArray(actionGroup) && actionGroup.length; })
        .map(function (actionGroup) {
        var items = actionGroup.map(function (_a) {
            var title = _a.title, $ref = _a.$ref;
            return ({
                key: get$kindFrom$ref($ref),
                name: title,
                onClick: function (e, itemData) { return onClick(itemData); },
            });
        });
        if (filter) {
            return items.filter(function (_a) {
                var key = _a.key;
                return filter(key);
            });
        }
        return items;
    });
    var flatMenuItems = itemGroups.reduce(function (resultItems, currentGroup, currentIndex) {
        if (currentIndex !== 0) {
            // push a sep line ahead.
            resultItems.push(createDivider());
        }
        resultItems.push.apply(resultItems, currentGroup);
        return resultItems;
    }, []);
    return flatMenuItems;
};
var createPasteButtonItem = function (menuItemCount, disabled, onClick) {
    return {
        key: 'Paste',
        name: formatMessage('Paste'),
        ariaLabel: formatMessage('Paste'),
        disabled: disabled,
        onRender: function () {
            return (jsx("button", { "aria-posinset": 1, "aria-setsize": menuItemCount + 1, css: css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            color: ", ";\n            background: #fff;\n            width: 100%;\n            height: 36px;\n            line-height: 36px;\n            border-style: none;\n            text-align: left;\n            padding: 0 8px;\n            outline: none;\n            &:hover {\n              background: rgb(237, 235, 233);\n            }\n          "], ["\n            color: ", ";\n            background: #fff;\n            width: 100%;\n            height: 36px;\n            line-height: 36px;\n            border-style: none;\n            text-align: left;\n            padding: 0 8px;\n            outline: none;\n            &:hover {\n              background: rgb(237, 235, 233);\n            }\n          "])), disabled ? '#BDBDBD' : '#0078D4'), disabled: disabled, name: formatMessage('Paste'), role: "menuitem", onClick: function () { return onClick({ key: MenuEventTypes.Paste }); } },
                jsx("div", null,
                    jsx(FontIcon, { css: css(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n                margin-right: 4px;\n              "], ["\n                margin-right: 4px;\n              "]))), iconName: "Paste" }),
                    jsx("span", null, formatMessage('Paste')))));
        },
    };
};
var createSubMenu = function (label, onClick, subItems) {
    return {
        key: label,
        text: label,
        subMenuProps: {
            items: subItems,
            onItemClick: function (e, itemData) { return onClick(itemData); },
        },
    };
};
export var createActionMenu = function (onClick, options, menuSchema, customActionGroups) {
    var _a;
    var _b;
    var resultItems = [];
    var menuOptions = menuSchema || {};
    // base SDK menu
    var baseMenuItems = createBaseActionMenu(menuOptions, onClick, options.isSelfHosted ? function ($kind) { return $kind !== SDKKinds.LogAction; } : undefined);
    resultItems.push.apply(resultItems, baseMenuItems);
    // Append a 'Custom Actions' item conditionally.
    if (customActionGroups) {
        // Exclude those $kinds already grouped by uischema
        var is$kindUngrouped = function ($kind) { return !menuOptions[$kind]; };
        var customActionItems = createCustomActionSubMenu(customActionGroups, onClick, is$kindUngrouped);
        if (customActionItems.length) {
            var customActionGroupName_1 = formatMessage('Custom Actions');
            var submenuWithDuplicatedName = resultItems.find(function (item) { return item.text === customActionGroupName_1; });
            if (submenuWithDuplicatedName) {
                // When 'Custom Actions' label exists, append custom actions after that submenu.
                (_b = submenuWithDuplicatedName.subMenuProps) === null || _b === void 0 ? void 0 : (_a = _b.items).push.apply(_a, customActionItems);
            }
            else {
                // Otherwise create a new submenu named as 'Custom Actions'.
                resultItems.push(createSubMenu(customActionGroupName_1, onClick, customActionItems));
            }
        }
    }
    // paste button
    var pasteButtonDisabled = !options.enablePaste;
    var pasteButton = createPasteButtonItem(resultItems.length, pasteButtonDisabled, onClick);
    resultItems.unshift(pasteButton, createDivider());
    return resultItems;
};
var templateObject_1, templateObject_2;
//# sourceMappingURL=createSchemaMenu.js.map