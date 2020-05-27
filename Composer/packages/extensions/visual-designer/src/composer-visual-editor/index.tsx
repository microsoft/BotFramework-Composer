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

import { NodeRendererContext, NodeRendererContextValue } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';
import { FlowSchemaContext } from './store/FlowSchemaContext';
import { FlowSchemaProvider } from './schema/flowSchemaProvider';
import { mergePluginConfig } from './utils/mergePluginConfig';
import { getCustomSchema } from './utils/getCustomSchema';
import { defaultFlowSchema } from './schema/defaultFlowSchema';
import { SelectionContext } from './store/SelectionContext';
import { KeyboardZone } from './components/lib/KeyboardZone';
import { mapKeyboardCommandToEditorEvent } from './utils/mapKeyboardCommandToEditorEvent.ts';
import { useSelectionEffect } from './hooks/useSelectionEffect';
import { useEditorEventApi } from './hooks/useEditorEventApi';
import { NodeEventTypes } from './adaptive-sdk/constants/NodeEventTypes';
import { AdaptiveDialogEditor } from './editors/AdaptiveDialogEditor';
import { VisualEditorNodeMenu, VisualEditorEdgeMenu, VisualEditorNodeWrapper } from './components/renderers';

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
<<<<<<< HEAD:Composer/packages/extensions/visual-designer/src/composer-visual-editor/index.tsx
            <div data-testid="visualdesigner-container" css={styles}>
              <SelectionContext.Provider value={selectionContext}>
                <KeyboardZone
                  onCommand={command => {
                    const editorEvent = mapKeyboardCommandToEditorEvent(command);
                    editorEvent && handleEditorEvent(editorEvent.type, editorEvent.payload);
                  }}
                  ref={divRef}
                >
                  <MarqueeSelection selection={selection} css={{ width: '100%', height: '100%' }}>
                    <div
                      className="visual-editor-container"
                      data-testid="visual-editor-container"
                      css={{
                        width: '100%',
                        height: '100%',
                        padding: '48px 20px',
                        boxSizing: 'border-box',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleEditorEvent(NodeEventTypes.Focus, { id: '' });
                      }}
                    >
                      <AdaptiveDialogEditor
                        dialogId={dialogId}
                        dialogData={data}
                        activeTrigger={focusedEvent}
                        onEvent={(eventName, eventData) => {
                          divRef.current?.focus({ preventScroll: true });
                          handleEditorEvent(eventName, eventData);
                        }}
                        EdgeMenu={VisualEditorEdgeMenu}
                        NodeMenu={VisualEditorNodeMenu}
                        NodeWrapper={VisualEditorNodeWrapper}
                      />
                    </div>
                  </MarqueeSelection>
                </KeyboardZone>
              </SelectionContext.Provider>
=======
            <div css={styles} data-testid="visualdesigner-container">
              <ObiEditor
                key={dialogId}
                announce={announce}
                data={data}
                focusedSteps={focusedActions}
                path={dialogId}
                redo={redo}
                undo={undo}
                onChange={(x) => saveData(x)}
                onClipboardChange={onCopy}
                onCreateDialog={createDialog}
                onFocusEvent={onFocusEvent}
                onFocusSteps={onFocusSteps}
                onOpen={(x) => navTo(x)}
                onSelect={onSelect}
              />
>>>>>>> master:Composer/packages/extensions/visual-designer/src/index.tsx
            </div>
          </FlowSchemaContext.Provider>
        </SelfHostContext.Provider>
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

export default VisualDesigner;
