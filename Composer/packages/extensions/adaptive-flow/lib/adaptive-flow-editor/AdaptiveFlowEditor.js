// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __makeTemplateObject, __rest } from "tslib";
/** @jsx jsx */
import { jsx, css, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { useRef, useMemo, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { DialogFactory } from '@bfc/shared';
import { useShellApi } from '@bfc/extension';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { NodeEventTypes } from '../adaptive-flow-renderer/constants/NodeEventTypes';
import { AdaptiveDialog } from '../adaptive-flow-renderer/adaptive/AdaptiveDialog';
import { NodeRendererContext } from './contexts/NodeRendererContext';
import { SelfHostContext } from './contexts/SelfHostContext';
import { getCustomSchema } from './utils/getCustomSchema';
import { SelectionContext } from './contexts/SelectionContext';
import { enableKeyboardCommandAttributes } from './components/KeyboardZone';
import { mapKeyboardCommandToEditorEvent } from './utils/mapKeyboardCommandToEditorEvent';
import { useSelectionEffect } from './hooks/useSelectionEffect';
import { useEditorEventApi } from './hooks/useEditorEventApi';
import { VisualEditorNodeMenu, VisualEditorEdgeMenu, VisualEditorNodeWrapper, VisualEditorElementWrapper, } from './renderers';
import { useFlowUIOptions } from './hooks/useFlowUIOptions';
formatMessage.setup({
    missingTranslation: 'ignore',
});
var emotionCache = createCache({
    // @ts-ignore
    nonce: window.__nonce__,
});
var styles = css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n\n  overflow: scroll;\n\n  border: 1px solid transparent;\n\n  &:focus {\n    outline: none;\n    border-color: black;\n  }\n"], ["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n\n  overflow: scroll;\n\n  border: 1px solid transparent;\n\n  &:focus {\n    outline: none;\n    border-color: black;\n  }\n"])));
var VisualDesigner = function (_a) {
    var _b;
    var onFocus = _a.onFocus, onBlur = _a.onBlur, schema = _a.schema;
    var _c = useShellApi(), shellApi = _c.shellApi, shellData = __rest(_c, ["shellApi"]);
    var _d = useFlowUIOptions(), schemaFromPlugins = _d.schema, widgetsFromPlugins = _d.widgets;
    var dialogId = shellData.dialogId, focusedEvent = shellData.focusedEvent, focusedActions = shellData.focusedActions, focusedTab = shellData.focusedTab, clipboardActions = shellData.clipboardActions, inputData = shellData.data, hosted = shellData.hosted, schemas = shellData.schemas;
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
    var focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';
    // Compute schema diff
    var customActionSchema = useMemo(function () { var _a; return getCustomSchema(schemas === null || schemas === void 0 ? void 0 : schemas.default, (_a = schemas === null || schemas === void 0 ? void 0 : schemas.sdk) === null || _a === void 0 ? void 0 : _a.content).actions; }, [
        (_b = schemas === null || schemas === void 0 ? void 0 : schemas.sdk) === null || _b === void 0 ? void 0 : _b.content,
        schemas === null || schemas === void 0 ? void 0 : schemas.default,
    ]);
    var nodeContext = {
        focusedId: focusedId,
        focusedEvent: focusedEvent,
        focusedTab: focusedTab,
        clipboardActions: clipboardActions || [],
        dialogFactory: new DialogFactory(schema),
        customSchemas: customActionSchema ? [customActionSchema] : [],
    };
    var customFlowSchema = nodeContext.customSchemas.reduce(function (result, s) {
        var definitionKeys = Object.keys(s.definitions);
        definitionKeys.forEach(function ($kind) {
            result[$kind] = {
                widget: 'ActionHeader',
                colors: { theme: '#69797E', color: 'white' },
            };
        });
        return result;
    }, {});
    var divRef = useRef(null);
    // send focus to the keyboard area when navigating to a new trigger
    useEffect(function () {
        var _a;
        (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, [focusedEvent]);
    var _e = useSelectionEffect({ data: data, nodeContext: nodeContext }, shellApi), selection = _e.selection, selectionContext = __rest(_e, ["selection"]);
    var handleEditorEvent = useEditorEventApi({ path: dialogId, data: data, nodeContext: nodeContext, selectionContext: selectionContext }, shellApi).handleEditorEvent;
    var handleCommand = function (command) {
        var editorEvent = mapKeyboardCommandToEditorEvent(command);
        editorEvent && handleEditorEvent(editorEvent.type, editorEvent.payload);
    };
    return (jsx(CacheProvider, { value: emotionCache },
        jsx(NodeRendererContext.Provider, { value: nodeContext },
            jsx(SelfHostContext.Provider, { value: hosted },
                jsx("div", __assign({ ref: divRef, css: styles, tabIndex: 0, onBlur: onBlur, onFocus: onFocus }, enableKeyboardCommandAttributes(handleCommand), { "data-testid": "visualdesigner-container" }),
                    jsx(SelectionContext.Provider, { value: selectionContext },
                        jsx(MarqueeSelection, { css: { width: '100%', height: '100%' }, selection: selection },
                            jsx("div", { className: "flow-editor-container", css: {
                                    width: '100%',
                                    height: '100%',
                                    padding: '48px 20px',
                                    boxSizing: 'border-box',
                                }, "data-testid": "flow-editor-container", onClick: function (e) {
                                    e.stopPropagation();
                                    handleEditorEvent(NodeEventTypes.Focus, { id: '' });
                                } },
                                jsx(AdaptiveDialog, { activeTrigger: focusedEvent, dialogData: data, dialogId: dialogId, renderers: {
                                        EdgeMenu: VisualEditorEdgeMenu,
                                        NodeMenu: VisualEditorNodeMenu,
                                        NodeWrapper: VisualEditorNodeWrapper,
                                        ElementWrapper: VisualEditorElementWrapper,
                                    }, schema: __assign(__assign({}, schemaFromPlugins), customFlowSchema), widgets: widgetsFromPlugins, onEvent: function (eventName, eventData) {
                                        var _a;
                                        (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
                                        handleEditorEvent(eventName, eventData);
                                    } })))))))));
};
export default VisualDesigner;
var templateObject_1;
//# sourceMappingURL=AdaptiveFlowEditor.js.map