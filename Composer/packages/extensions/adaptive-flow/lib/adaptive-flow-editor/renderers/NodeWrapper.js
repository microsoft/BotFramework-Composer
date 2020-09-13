// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __makeTemplateObject } from 'tslib';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext, useCallback } from 'react';
import { generateSDKTitle } from '@bfc/shared';
import { useShellApi } from '@bfc/extension';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../contexts/NodeRendererContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
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
export var ActionNodeWrapper = function (_a) {
  var id = _a.id,
    tab = _a.tab,
    data = _a.data,
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
  var addCoachMarkRef = useShellApi().shellApi.addCoachMarkRef;
  var actionRef = useCallback(function (action) {
    addCoachMarkRef({ action: action });
  }, []);
  // Set 'use-select' to none to disable browser's default
  // text selection effect when pressing Shift + Click.
  return jsx(
    'div',
    __assign(
      {
        ref: actionRef,
        css: css(
          templateObject_4 ||
            (templateObject_4 = __makeTemplateObject(
              [
                '\n        user-select: none;\n        position: relative;\n        border-radius: 2px 2px 0 0;\n        ',
                ';\n        ',
                ';\n        ',
                ';\n        &:hover {\n          ',
                '\n        }\n      ',
              ],
              [
                '\n        user-select: none;\n        position: relative;\n        border-radius: 2px 2px 0 0;\n        ',
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
        'data-testid': 'ActionNodeWrapper',
      },
      declareElementAttributes(selectableId, id),
      {
        'aria-label': generateSDKTitle(data, '', tab),
        onClick: function (e) {
          e.stopPropagation();
          e.preventDefault();
          var payload = { id: id, tab: tab };
          if (e.ctrlKey || e.metaKey) {
            return onEvent(NodeEventTypes.CtrlClick, payload);
          }
          if (e.shiftKey) {
            return onEvent(NodeEventTypes.ShiftClick, payload);
          }
          onEvent(NodeEventTypes.Focus, payload);
        },
      }
    ),
    children
  );
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=NodeWrapper.js.map
