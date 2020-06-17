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
import { jsx, css } from '@emotion/core';
import { useCallback, useContext } from 'react';
import classnames from 'classnames';
import { generateSDKTitle } from '@bfc/shared';
import { useShellApi } from '@bfc/extension';
import { AttrNames } from '../../constants/ElementAttributes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
var nodeBorderHoveredStyle = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  box-shadow: 0px 0px 0px 1px #323130;\n'],
      ['\n  box-shadow: 0px 0px 0px 1px #323130;\n']
    ))
);
var nodeBorderSelectedStyle = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  box-shadow: 0px 0px 0px 2px #0078d4;\n'],
      ['\n  box-shadow: 0px 0px 0px 2px #0078d4;\n']
    ))
);
// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
var nodeBorderDoubleSelectedStyle = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(
      ['\n  box-shadow: 0px 0px 0px 2px #0078d4, 0px 0px 0px 6px rgba(0, 120, 212, 0.3);\n'],
      ['\n  box-shadow: 0px 0px 0px 2px #0078d4, 0px 0px 0px 6px rgba(0, 120, 212, 0.3);\n']
    ))
);
function checkHasProps(node) {
  return node.props != null;
}
function extractNodeTitle(node, titleInHeader) {
  var _a, _b;
  if (node == null || typeof node !== 'object') {
    return '';
  }
  if (checkHasProps(node)) {
    var props = node.props;
    if ((props === null || props === void 0 ? void 0 : props.header) != null && titleInHeader) {
      return (
        ((_b =
          (_a = props === null || props === void 0 ? void 0 : props.header) === null || _a === void 0
            ? void 0
            : _a.props) === null || _b === void 0
          ? void 0
          : _b.title) || ''
      );
    } else if ((props === null || props === void 0 ? void 0 : props.data) != null) {
      return generateSDKTitle(props.data);
    } else if ((props === null || props === void 0 ? void 0 : props.children) != null) {
      return extractNodeTitle(props.children, titleInHeader);
    } else {
      return '';
    }
  }
  return '';
}
export var ElementWrapper = function (_a) {
  var id = _a.id,
    tab = _a.tab,
    titleInHeader = _a.titleInHeader,
    onEvent = _a.onEvent,
    children = _a.children;
  var selectableId = tab ? '' + id + tab : id;
  var _b = useContext(NodeRendererContext),
    focusedId = _b.focusedId,
    focusedEvent = _b.focusedEvent,
    focusedTab = _b.focusedTab;
  var _c = useContext(SelectionContext),
    selectedIds = _c.selectedIds,
    getNodeIndex = _c.getNodeIndex;
  var nodeFocused = focusedId === id || focusedEvent === id;
  var nodeDoubleSelected = tab && nodeFocused && tab === focusedTab;
  var nodeSelected = selectedIds.includes(id);
  var shellApi = useShellApi().shellApi;
  var addCoachMarkRef = shellApi.addCoachMarkRef;
  var addRef = useCallback(function (action) {
    return addCoachMarkRef({ action: action });
  }, []);
  var declareElementAttributes = function (selectedId, id) {
    var _a;
    return (
      (_a = {}),
      (_a[AttrNames.NodeElement] = true),
      (_a[AttrNames.FocusableElement] = true),
      (_a[AttrNames.FocusedId] = id),
      (_a[AttrNames.SelectableElement] = true),
      (_a[AttrNames.SelectedId] = selectedId),
      (_a[AttrNames.SelectionIndex] = getNodeIndex(id)),
      (_a[AttrNames.Tab] = tab),
      _a
    );
  };
  var ariaLabel = extractNodeTitle(
    children,
    titleInHeader !== null && titleInHeader !== void 0 ? titleInHeader : false
  );
  return jsx(
    'div',
    __assign(
      {
        ref: addRef,
        className: classnames('step-renderer-container', { 'step-renderer-container--focused': nodeFocused }),
        css: css(
          templateObject_4 ||
            (templateObject_4 = __makeTemplateObject(
              [
                '\n        position: relative;\n        border-radius: 2px 2px 0 0;\n        ',
                ';\n        ',
                ';\n        ',
                ';\n        &:hover {\n          ',
                '\n        }\n      ',
              ],
              [
                '\n        position: relative;\n        border-radius: 2px 2px 0 0;\n        ',
                ';\n        ',
                ';\n        ',
                ';\n        &:hover {\n          ',
                '\n        }\n      ',
              ]
            )),
          nodeSelected && nodeBorderSelectedStyle,
          nodeFocused && nodeBorderSelectedStyle,
          nodeDoubleSelected && nodeBorderDoubleSelectedStyle,
          !nodeFocused && nodeBorderHoveredStyle
        ),
      },
      declareElementAttributes(selectableId, id),
      {
        'aria-label': ariaLabel,
        onClick: function (e) {
          e.stopPropagation();
          onEvent(NodeEventTypes.Focus, { id: id, tab: tab });
        },
      }
    ),
    children
  );
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=ElementWrapper.js.map
