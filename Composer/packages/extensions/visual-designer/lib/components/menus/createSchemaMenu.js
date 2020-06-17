// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { ContextualMenuItemType } from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { ConceptLabels, DialogGroup, dialogGroups, SDKKinds } from '@bfc/shared';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { MenuEventTypes } from '../../constants/MenuTypes';
var resolveMenuTitle = function ($kind) {
  var conceptLabel = ConceptLabels[$kind];
  return (conceptLabel === null || conceptLabel === void 0 ? void 0 : conceptLabel.title) || $kind;
};
var createBaseActionMenu = function (onClick, filter) {
  var pickedGroups = [
    DialogGroup.RESPONSE,
    DialogGroup.INPUT,
    DialogGroup.BRANCHING,
    DialogGroup.LOOPING,
    DialogGroup.STEP,
    DialogGroup.MEMORY,
    DialogGroup.CODE,
    DialogGroup.LOG,
  ];
  var stepMenuItems = pickedGroups
    .map(function (key) {
      return dialogGroups[key];
    })
    .filter(function (groupItem) {
      return groupItem && Array.isArray(groupItem.types) && groupItem.types.length;
    })
    .map(function (_a) {
      var label = _a.label,
        actionKinds = _a.types;
      var subMenuItems = actionKinds
        .filter(function ($kind) {
          return filter ? filter($kind) : true;
        })
        .map(function ($kind) {
          return {
            key: $kind,
            name: resolveMenuTitle($kind),
            onClick: function (e, itemData) {
              return onClick(itemData);
            },
          };
        });
      if (subMenuItems.length === 1) {
        // hoists the only item to upper level
        return subMenuItems[0];
      }
      return createSubMenu(label, onClick, subMenuItems);
    });
  return stepMenuItems;
};
var createDivider = function () {
  return {
    key: 'divider',
    itemType: ContextualMenuItemType.Divider,
  };
};
var get$kindFrom$ref = function ($ref) {
  return $ref.replace('#/definitions/', '');
};
var createCustomActionSubMenu = function (customizedActionGroups, onClick) {
  if (!Array.isArray(customizedActionGroups) || customizedActionGroups.length === 0) {
    return [];
  }
  var itemGroups = customizedActionGroups
    .filter(function (actionGroup) {
      return Array.isArray(actionGroup) && actionGroup.length;
    })
    .map(function (actionGroup) {
      return actionGroup.map(function (_a) {
        var title = _a.title,
          $ref = _a.$ref;
        return {
          key: get$kindFrom$ref($ref),
          name: title,
          onClick: function (e, itemData) {
            return onClick(itemData);
          },
        };
      });
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
    name: 'Paste',
    ariaLabel: 'Paste',
    disabled: disabled,
    onRender: function () {
      return jsx(
        'button',
        {
          'aria-posinset': 1,
          'aria-setsize': menuItemCount + 1,
          css: css(
            templateObject_1 ||
              (templateObject_1 = __makeTemplateObject(
                [
                  '\n            color: ',
                  ';\n            background: #fff;\n            width: 100%;\n            height: 36px;\n            line-height: 36px;\n            border-style: none;\n            text-align: left;\n            padding: 0 8px;\n            outline: none;\n            &:hover {\n              background: rgb(237, 235, 233);\n            }\n          ',
                ],
                [
                  '\n            color: ',
                  ';\n            background: #fff;\n            width: 100%;\n            height: 36px;\n            line-height: 36px;\n            border-style: none;\n            text-align: left;\n            padding: 0 8px;\n            outline: none;\n            &:hover {\n              background: rgb(237, 235, 233);\n            }\n          ',
                ]
              )),
            disabled ? '#BDBDBD' : '#0078D4'
          ),
          disabled: disabled,
          name: 'Paste',
          role: 'menuitem',
          onClick: function () {
            return onClick({ key: MenuEventTypes.Paste });
          },
        },
        jsx(
          'div',
          null,
          jsx(FontIcon, {
            css: css(
              templateObject_2 ||
                (templateObject_2 = __makeTemplateObject(
                  ['\n                margin-right: 4px;\n              '],
                  ['\n                margin-right: 4px;\n              ']
                ))
            ),
            iconName: 'Paste',
          }),
          jsx('span', null, 'Paste')
        )
      );
    },
  };
};
var createSubMenu = function (label, onClick, subItems) {
  return {
    key: label,
    text: label,
    subMenuProps: {
      items: subItems,
      onItemClick: function (e, itemData) {
        return onClick(itemData);
      },
    },
  };
};
export var createActionMenu = function (onClick, options, customActionGroups) {
  var resultItems = [];
  // base SDK menu
  var baseMenuItems = createBaseActionMenu(
    onClick,
    options.isSelfHosted
      ? function ($kind) {
          return $kind !== SDKKinds.LogAction;
        }
      : undefined
  );
  resultItems.push.apply(resultItems, baseMenuItems);
  // Append a 'Custom Actions' item conditionally.
  if (customActionGroups) {
    var customActionItems = createCustomActionSubMenu(customActionGroups, onClick);
    if (customActionItems.length) {
      var customActionTitle = formatMessage('Custom Actions');
      resultItems.push(createSubMenu(customActionTitle, onClick, customActionItems));
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
