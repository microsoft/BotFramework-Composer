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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
/** @jsx jsx */
import { jsx, css, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { useRef, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { DialogFactory } from '@bfc/shared';
import { useShellApi } from '@bfc/extension';
import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';
import { FlowSchemaContext } from './store/FlowSchemaContext';
import { FlowSchemaProvider } from './schema/flowSchemaProvider';
import { mergePluginConfig } from './utils/mergePluginConfig';
import { getCustomSchema } from './utils/getCustomSchema';
import { defaultFlowSchema } from './schema/defaultFlowSchema';
formatMessage.setup({
  missingTranslation: 'ignore',
});
var emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});
var styles = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n\n  overflow: scroll;\n'],
      ['\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n\n  overflow: scroll;\n']
    ))
);
var VisualDesigner = function (_a) {
  var _b;
  var schema = _a.schema;
  var _c = useShellApi(),
    shellApi = _c.shellApi,
    plugins = _c.plugins,
    shellData = __rest(_c, ['shellApi', 'plugins']);
  var dialogId = shellData.dialogId,
    focusedEvent = shellData.focusedEvent,
    focusedActions = shellData.focusedActions,
    focusedTab = shellData.focusedTab,
    clipboardActions = shellData.clipboardActions,
    inputData = shellData.data,
    hosted = shellData.hosted,
    schemas = shellData.schemas;
  var dataCache = useRef({});
  /**
   * VisualDesigner is coupled with ShellApi where input json always mutates.
   * Deep checking input data here to make React change detection works.
   */
  var dataChanged = !isEqual(dataCache.current, inputData);
  if (dataChanged) {
    dataCache.current = inputData;
  }
  var data = dataCache.current;
  var navTo = shellApi.navTo,
    onFocusEvent = shellApi.onFocusEvent,
    onFocusSteps = shellApi.onFocusSteps,
    onSelect = shellApi.onSelect,
    onCopy = shellApi.onCopy,
    saveData = shellApi.saveData,
    createDialog = shellApi.createDialog,
    updateLgTemplate = shellApi.updateLgTemplate,
    getLgTemplates = shellApi.getLgTemplates,
    copyLgTemplate = shellApi.copyLgTemplate,
    removeLgTemplate = shellApi.removeLgTemplate,
    removeLgTemplates = shellApi.removeLgTemplates,
    removeLuIntent = shellApi.removeLuIntent,
    undo = shellApi.undo,
    redo = shellApi.redo,
    announce = shellApi.announce;
  var focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';
  // Compute schema diff
  var customSchema = useMemo(
    function () {
      var _a;
      return getCustomSchema(
        schemas === null || schemas === void 0 ? void 0 : schemas.default,
        (_a = schemas === null || schemas === void 0 ? void 0 : schemas.sdk) === null || _a === void 0
          ? void 0
          : _a.content
      );
    },
    [
      (_b = schemas === null || schemas === void 0 ? void 0 : schemas.sdk) === null || _b === void 0
        ? void 0
        : _b.content,
      schemas === null || schemas === void 0 ? void 0 : schemas.default,
    ]
  );
  var nodeContext = {
    focusedId: focusedId,
    focusedEvent: focusedEvent,
    focusedTab: focusedTab,
    clipboardActions: clipboardActions || [],
    updateLgTemplate: updateLgTemplate,
    getLgTemplates: getLgTemplates,
    copyLgTemplate: function (id, from, to) {
      return copyLgTemplate(id, from, to).catch(function () {
        return undefined;
      });
    },
    removeLgTemplate: removeLgTemplate,
    removeLgTemplates: removeLgTemplates,
    removeLuIntent: removeLuIntent,
    dialogFactory: new DialogFactory(schema),
    customSchemas: customSchema ? [customSchema] : [],
  };
  var visualEditorConfig = mergePluginConfig.apply(void 0, plugins);
  var customFlowSchema = nodeContext.customSchemas.reduce(function (result, s) {
    var definitionKeys = Object.keys(s.definitions);
    definitionKeys.forEach(function ($kind) {
      result[$kind] = defaultFlowSchema.custom;
    });
    return result;
  }, {});
  return jsx(
    CacheProvider,
    { value: emotionCache },
    jsx(
      NodeRendererContext.Provider,
      { value: nodeContext },
      jsx(
        SelfHostContext.Provider,
        { value: hosted },
        jsx(
          FlowSchemaContext.Provider,
          {
            value: {
              widgets: visualEditorConfig.widgets,
              schemaProvider: new FlowSchemaProvider(visualEditorConfig.schema, customFlowSchema),
            },
          },
          jsx(
            'div',
            { css: styles, 'data-testid': 'visualdesigner-container' },
            jsx(ObiEditor, {
              key: dialogId,
              announce: announce,
              data: data,
              focusedSteps: focusedActions,
              path: dialogId,
              redo: redo,
              undo: undo,
              onChange: function (x) {
                return saveData(x);
              },
              onClipboardChange: onCopy,
              onCreateDialog: createDialog,
              onFocusEvent: onFocusEvent,
              onFocusSteps: onFocusSteps,
              onOpen: function (x) {
                return navTo(x);
              },
              onSelect: onSelect,
            })
          )
        )
      )
    )
  );
};
export default VisualDesigner;
var templateObject_1;
//# sourceMappingURL=index.js.map
