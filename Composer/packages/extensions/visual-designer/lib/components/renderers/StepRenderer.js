// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import get from 'lodash/get';
import { defaultNodeProps } from '../nodes/nodeProps';
import { renderUIWidget } from '../../schema/flowSchemaRenderer';
import { FlowSchemaContext } from '../../store/FlowSchemaContext';
import { ElementWrapper } from './ElementWrapper';
import { ElementMeasurer } from './ElementMeasurer';
export var StepRenderer = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize;
  var _b = useContext(FlowSchemaContext),
    widgets = _b.widgets,
    schemaProvider = _b.schemaProvider;
  var $kind = get(data, '$kind', '');
  var widgetSchema = schemaProvider.get($kind);
  var content = renderUIWidget(widgetSchema, widgets, { id: id, data: data, onEvent: onEvent, onResize: onResize });
  if (widgetSchema.nowrap) {
    return content;
  }
  return jsx(
    ElementWrapper,
    { id: id, onEvent: onEvent },
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
//# sourceMappingURL=StepRenderer.js.map
