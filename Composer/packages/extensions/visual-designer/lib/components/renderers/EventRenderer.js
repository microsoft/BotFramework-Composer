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
var _a;
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext } from 'react';
import classnames from 'classnames';
import { ObiTypes } from '../../constants/ObiTypes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { IntentRule, ConversationUpdateActivityRule, EventRule, UnknownIntentRule } from '../nodes/index';
import { defaultNodeProps } from '../nodes/nodeProps';
var rendererByObiType =
  ((_a = {}),
  (_a[ObiTypes.OnCondition] = EventRule),
  (_a[ObiTypes.OnIntent] = IntentRule),
  (_a[ObiTypes.OnUnknownIntent] = UnknownIntentRule),
  (_a[ObiTypes.OnConversationUpdateActivity] = ConversationUpdateActivityRule),
  _a);
var DEFAULT_RENDERER = UnknownIntentRule;
function chooseRendererByType($kind) {
  var renderer = rendererByObiType[$kind] || DEFAULT_RENDERER;
  return renderer;
}
var nodeBorderStyle = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(['\n  outline: 2px solid grey;\n'], ['\n  outline: 2px solid grey;\n']))
);
export var EventRenderer = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize;
  var ChosenRenderer = chooseRendererByType(data.$kind);
  var _b = useContext(NodeRendererContext),
    focusedId = _b.focusedId,
    focusedEvent = _b.focusedEvent;
  var nodeFocused = focusedId === id || focusedEvent === id;
  return jsx(
    'div',
    {
      className: classnames('event-renderer-container', { 'event-renderer-container--focused': nodeFocused }),
      css: css(
        templateObject_2 ||
          (templateObject_2 = __makeTemplateObject(
            ['\n        display: inline-block;\n        position: relative;\n        ', '\n      '],
            ['\n        display: inline-block;\n        position: relative;\n        ', '\n      ']
          )),
        nodeFocused && nodeBorderStyle
      ),
    },
    jsx(ChosenRenderer, {
      data: data,
      focused: nodeFocused,
      id: id,
      onEvent: onEvent,
      onResize: function (size) {
        onResize(size, 'node');
      },
    })
  );
};
EventRenderer.defaultProps = defaultNodeProps;
var templateObject_1, templateObject_2;
//# sourceMappingURL=EventRenderer.js.map
