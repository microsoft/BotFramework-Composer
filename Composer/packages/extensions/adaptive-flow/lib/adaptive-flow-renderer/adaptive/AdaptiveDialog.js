// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import get from 'lodash/get';
import { RendererContext, DefaultRenderers } from '../contexts/RendererContext';
import builtinSchema from '../configs/builtinSchema';
import builtinWidgets from '../configs/builtinWidgets';
import { SchemaContext } from '../contexts/SchemaContext';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';
import { AdaptiveTrigger } from './AdaptiveTrigger';
export var AdaptiveDialog = function (_a) {
  var dialogId = _a.dialogId,
    dialogData = _a.dialogData,
    activeTrigger = _a.activeTrigger,
    onEvent = _a.onEvent,
    _b = _a.schema,
    schema = _b === void 0 ? builtinSchema : _b,
    _c = _a.widgets,
    widgets = _c === void 0 ? builtinWidgets : _c,
    _d = _a.renderers,
    renderers = _d === void 0 ? {} : _d;
  var activeTriggerData = get(dialogData, activeTrigger, null);
  if (!activeTriggerData) {
    return jsx(Fragment, null);
  }
  return jsx(
    SchemaContext.Provider,
    {
      value: {
        widgets: __assign(__assign({}, builtinWidgets), widgets),
        schemaProvider: new WidgetSchemaProvider(builtinSchema, schema),
      },
    },
    jsx(
      RendererContext.Provider,
      { value: __assign(__assign({}, DefaultRenderers), renderers) },
      jsx(AdaptiveTrigger, {
        key: dialogId + '/' + activeTrigger,
        triggerData: activeTriggerData,
        triggerId: activeTrigger,
        onEvent: onEvent,
      })
    )
  );
};
AdaptiveDialog.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: function () {
    return null;
  },
};
//# sourceMappingURL=AdaptiveDialog.js.map
