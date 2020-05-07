// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
import React from 'react';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { COMPOUND_TYPES } from '@bfc/shared';
import { DetailsList, SelectionMode, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenuItemType, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { buildDialogOptions, swap, remove, insertAt } from '../utils';
import { BaseField } from './BaseField';
function ItemActions(props) {
  var item = props.item,
    navPrefix = props.navPrefix,
    index = props.index,
    onChange = props.onChange,
    formData = props.formData,
    formContext = props.formContext,
    newOptions = props.newOptions;
  if (typeof index === 'undefined') {
    return null;
  }
  var menuItems = [
    {
      key: 'edit',
      text: formatMessage('Edit'),
      iconProps: { iconName: 'Edit' },
      onClick: function() {
        // @ts-ignore - IDialog could potentially be a string, so TS complains about $type
        if (COMPOUND_TYPES.includes(item.$type)) {
          formContext.shellApi.onFocusEvent(navPrefix + '[' + index + ']');
        }
        formContext.shellApi.onFocusSteps([navPrefix + '[' + index + ']']);
      },
    },
    {
      key: 'moveUp',
      text: formatMessage('Move Up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: index === 0,
      onClick: function() {
        var newItems = swap(formData, index, index - 1);
        onChange(newItems);
      },
    },
    {
      key: 'moveDown',
      text: formatMessage('Move Down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: index === formData.length - 1,
      onClick: function() {
        var newItems = swap(formData, index, index + 1);
        onChange(newItems);
      },
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      onClick: function() {
        var item = formData[index];
        // @ts-ignore
        if (item.$type === 'Microsoft.SendActivity' && item.activity && item.activity.indexOf('bfdactivity-') !== -1) {
          // TODO: (ze) 'removeLgTemplate' -> 'removeLgTemplateRef', it should accept inputs like '[bfdactivity-1234]'
          // @ts-ignore
          formContext.shellApi.removeLgTemplate('common', item.activity.slice(1, item.activity.length - 1));
        }
        var newItems = remove(formData, index);
        onChange(newItems);
      },
    },
    {
      key: 'divider_1',
      itemType: ContextualMenuItemType.Divider,
    },
    {
      key: 'new',
      text: formatMessage('New'),
      subMenuProps: {
        items: newOptions,
        calloutProps: { calloutMaxHeight: 500 },
        directionalHint: DirectionalHint.rightTopEdge,
      },
    },
  ];
  return React.createElement(IconButton, {
    menuProps: { items: menuItems },
    menuIconProps: { iconName: 'MoreVertical' },
    styles: { menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } },
  });
}
export function TableField(props) {
  var _a = props.additionalColumns,
    additionalColumns = _a === void 0 ? [] : _a,
    columnHeader = props.columnHeader,
    dialogOptionsOpts = props.dialogOptionsOpts,
    renderDescription = props.renderDescription,
    children = props.children,
    navPrefix = props.navPrefix,
    formContext = props.formContext;
  var fieldOverrides = get(props.formContext.editorSchema, 'content.SDKOverrides');
  var items = props.formData;
  var onChange = function(newItem) {
    if (Array.isArray(newItem)) {
      props.onChange(newItem);
    } else {
      props.onChange(__spreadArrays(items, [newItem]));
    }
  };
  var renderTitle = function(item) {
    if (get(item, '$designer.name')) {
      return get(item, '$designer.name');
    } else if (fieldOverrides[item.$type] && fieldOverrides[item.$type].title) {
      return fieldOverrides[item.$type].title;
    } else {
      return item.$type;
    }
  };
  var createNewItemAtIndex = function(idx) {
    if (idx === void 0) {
      idx = items.length;
    }
    return function(_, item) {
      onChange(insertAt(items, item.data, idx));
      // wait until change can propogate before navigating
      setTimeout(function() {
        // @ts-ignore - IDialog could potentially be a string, so TS complains about $type
        if (COMPOUND_TYPES.includes(item.$type)) {
          formContext.shellApi.onFocusEvent(navPrefix + '[' + idx + ']');
        }
        formContext.shellApi.onFocusSteps([navPrefix + '[' + idx + ']']);
      }, 500);
      return true;
    };
  };
  var columns = __spreadArrays(
    [
      {
        key: 'name',
        name: columnHeader || formatMessage('Name'),
        minWidth: 30,
        maxWidth: 150,
        isResizable: true,
        // eslint-disable-next-line react/display-name
        onRender: function(item) {
          return React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', height: '100%' } },
            renderTitle(item)
          );
        },
      },
      {
        key: 'description',
        name: formatMessage('Description'),
        minWidth: 30,
        isResizable: true,
        onRender: renderDescription
          ? // eslint-disable-next-line react/display-name
            function(
              // eslint-disable-next-line react/display-name
              item
            ) {
              return React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', height: '100%' } },
                renderDescription(item)
              );
            }
          : undefined,
      },
    ],
    additionalColumns,
    [
      {
        key: 'menu',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        // eslint-disable-next-line react/display-name
        onRender: function(item, index) {
          return React.createElement(
            ItemActions,
            __assign({}, props, {
              item: item,
              index: index,
              newOptions: buildDialogOptions(
                __assign(__assign({}, dialogOptionsOpts), {
                  onClick: createNewItemAtIndex(typeof index === 'undefined' ? 0 : index + 1),
                })
              ),
            })
          );
        },
      },
    ]
  );
  return React.createElement(
    BaseField,
    __assign({}, props),
    items &&
      items.length > 0 &&
      React.createElement(DetailsList, {
        columns: columns,
        items: items,
        selectionMode: SelectionMode.none,
        layoutMode: DetailsListLayoutMode.justified,
        styles: {
          // offset the header padding
          root: { marginTop: '-16px' },
        },
      }),
    children && children({ onChange: onChange, createNewItemAtIndex: createNewItemAtIndex })
  );
}
TableField.defaultProps = {
  additionalColumns: [],
  formData: [],
  navPrefix: '',
  onChange: function() {},
  renderTitle: function(item) {
    return get(item, '$designer.name', item.$type);
  },
  renderDescription: function(item) {
    return get(item, '$designer.description');
  },
};
//# sourceMappingURL=TableField.js.map
