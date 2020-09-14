// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import get from 'lodash/get';
import { defaultNodeProps } from '../types/nodeProps';
import { renderUIWidget } from '../utils/visual/widgetRenderer';
import { SchemaContext } from '../contexts/SchemaContext';
import { RendererContext } from '../contexts/RendererContext';
import { ElementMeasurer } from '../components/ElementMeasurer';
export var StepRenderer = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize;
  var _b = useContext(SchemaContext),
    widgets = _b.widgets,
    schemaProvider = _b.schemaProvider;
  var NodeWrapper = useContext(RendererContext).NodeWrapper;
  var $kind = get(data, '$kind', '');
  var widgetSchema = schemaProvider.get($kind);
  var content = renderUIWidget(widgetSchema, widgets, { id: id, data: data, onEvent: onEvent, onResize: onResize });
  if (widgetSchema.nowrap) {
    return content;
  }
  return jsx(
    NodeWrapper,
    { nodeData: data, nodeId: id, onEvent: onEvent },
    jsx(
      ElementMeasurer,
      {
        onResize: function (boundary) {
          return onResize(boundary);
        },
      },
      content
    )
  );
};
StepRenderer.defaultProps = defaultNodeProps;
//# sourceMappingURL=AdaptiveAction.js.map
