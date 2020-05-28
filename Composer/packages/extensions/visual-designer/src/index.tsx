// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import React, { useRef, useMemo, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { DialogFactory } from '@bfc/shared';
import { useShellApi, JSONSchema7, FlowSchema } from '@bfc/extension';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { NodeRendererContext, NodeRendererContextValue } from './composer-flow-editor/contexts/NodeRendererContext';
import { SelfHostContext } from './composer-flow-editor/contexts/SelfHostContext';
import { FlowSchemaContext } from './adaptive-visual-sdk/contexts/FlowSchemaContext';
import { FlowSchemaProvider } from './schema/flowSchemaProvider';
import { mergePluginConfig } from './composer-flow-editor/utils/mergePluginConfig';
import { getCustomSchema } from './composer-flow-editor/utils/getCustomSchema';
import { defaultFlowSchema } from './adaptive-visual-sdk/configs/defaultFlowSchema';
import { SelectionContext } from './composer-flow-editor/contexts/SelectionContext';
import { KeyboardZone } from './composer-flow-editor/components/KeyboardZone';
import { mapKeyboardCommandToEditorEvent } from './composer-flow-editor/utils/mapKeyboardCommandToEditorEvent.ts';
import { useSelectionEffect } from './composer-flow-editor/hooks/useSelectionEffect';
import { useEditorEventApi } from './composer-flow-editor/hooks/useEditorEventApi';
import { NodeEventTypes } from './adaptive-visual-sdk/constants/NodeEventTypes';
import { AdaptiveDialogEditor } from './adaptive-visual-sdk/editors/AdaptiveDialogEditor';
import { VisualEditorNodeMenu, VisualEditorEdgeMenu, VisualEditorNodeWrapper } from './composer-flow-editor/renderers';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

const styles = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  overflow: scroll;
`;

export interface VisualDesignerProps {
  schema?: JSONSchema7;
}
const VisualDesigner: React.FC<VisualDesignerProps> = ({ schema }): JSX.Element => {
  const { shellApi, plugins, ...shellData } = useShellApi();
  const {
    dialogId,
    focusedEvent,
    focusedActions,
    focusedTab,
    clipboardActions,
    data: inputData,
    hosted,
    schemas,
  } = shellData;

  const dataCache = useRef({});

  /**
   * VisualDesigner is coupled with ShellApi where input json always mutates.
   * Deep checking input data here to make React change detection works.
   */
  const dataChanged = !isEqual(dataCache.current, inputData);
  if (dataChanged) {
    dataCache.current = inputData;
  }

  const data = dataCache.current;
  const focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';

  // Compute schema diff
  const customSchema = useMemo(() => getCustomSchema(schemas?.default, schemas?.sdk?.content), [
    schemas?.sdk?.content,
    schemas?.default,
  ]);

  const nodeContext: NodeRendererContextValue = {
    focusedId,
    focusedEvent,
    focusedTab,
    clipboardActions: clipboardActions || [],
    dialogFactory: new DialogFactory(schema),
    customSchemas: customSchema ? [customSchema] : [],
  };

  const visualEditorConfig = mergePluginConfig(...plugins);
  const customFlowSchema: FlowSchema = nodeContext.customSchemas.reduce((result, s) => {
    const definitionKeys: string[] = Object.keys(s.definitions);
    definitionKeys.forEach(($kind) => {
      result[$kind] = defaultFlowSchema.custom;
    });
    return result;
  }, {} as FlowSchema);

  const divRef = useRef<HTMLDivElement>(null);

  // send focus to the keyboard area when navigating to a new trigger
  useEffect(() => {
    divRef.current?.focus();
  }, [focusedEvent]);

  const { selection, ...selectionContext } = useSelectionEffect({ data, nodeContext }, shellApi);
  const { handleEditorEvent } = useEditorEventApi({ path: dialogId, data, nodeContext, selectionContext }, shellApi);

  return (
    <CacheProvider value={emotionCache}>
      <NodeRendererContext.Provider value={nodeContext}>
        <SelfHostContext.Provider value={hosted}>
          <FlowSchemaContext.Provider
            value={{
              widgets: visualEditorConfig.widgets,
              schemaProvider: new FlowSchemaProvider(visualEditorConfig.schema, customFlowSchema),
            }}
          >
            <div css={styles} data-testid="visualdesigner-container">
              <SelectionContext.Provider value={selectionContext}>
                <KeyboardZone
                  ref={divRef}
                  onCommand={(command) => {
                    const editorEvent = mapKeyboardCommandToEditorEvent(command);
                    editorEvent && handleEditorEvent(editorEvent.type, editorEvent.payload);
                  }}
                >
                  <MarqueeSelection css={{ width: '100%', height: '100%' }} selection={selection}>
                    <div
                      className="visual-editor-container"
                      css={{
                        width: '100%',
                        height: '100%',
                        padding: '48px 20px',
                        boxSizing: 'border-box',
                      }}
                      data-testid="visual-editor-container"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditorEvent(NodeEventTypes.Focus, { id: '' });
                      }}
                    >
                      <AdaptiveDialogEditor
                        activeTrigger={focusedEvent}
                        dialogData={data}
                        dialogId={dialogId}
                        EdgeMenu={VisualEditorEdgeMenu}
                        NodeMenu={VisualEditorNodeMenu}
                        NodeWrapper={VisualEditorNodeWrapper}
                        onEvent={(eventName, eventData) => {
                          divRef.current?.focus({ preventScroll: true });
                          handleEditorEvent(eventName, eventData);
                        }}
                      />
                    </div>
                  </MarqueeSelection>
                </KeyboardZone>
              </SelectionContext.Provider>
            </div>
          </FlowSchemaContext.Provider>
        </SelfHostContext.Provider>
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

export default VisualDesigner;
