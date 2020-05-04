// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import React, { useRef, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { DialogFactory } from '@bfc/shared';
import { useShellApi, JSONSchema7 } from '@bfc/extension';

import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext, NodeRendererContextValue } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';
import { FlowSchemaContext } from './store/FlowSchemaContext';
import { FlowSchemaProvider } from './schema/flowSchemaProvider';
import { mergePluginConfig } from './utils/mergePluginConfig';
import { getCustomSchema } from './utils/getCustomSchema';

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
  const {
    addCoachMarkRef,
    navTo,
    onFocusEvent,
    onFocusSteps,
    onSelect,
    onCopy,
    saveData,
    createDialog,
    updateLgTemplate,
    getLgTemplates,
    copyLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
    removeLuIntent,
    undo,
    redo,
    announce,
  } = shellApi;

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
    updateLgTemplate,
    getLgTemplates,
    copyLgTemplate: (id: string, from: string, to?: string) => copyLgTemplate(id, from, to).catch(() => undefined),
    removeLgTemplate,
    removeLgTemplates,
    removeLuIntent,
    dialogFactory: new DialogFactory(schema),
    customSchemas: customSchema ? [customSchema] : [],
  };

  const visualEditorConfig = mergePluginConfig(...plugins);

  return (
    <CacheProvider value={emotionCache}>
      <NodeRendererContext.Provider value={nodeContext}>
        <SelfHostContext.Provider value={hosted}>
          <FlowSchemaContext.Provider
            value={{
              widgets: visualEditorConfig.widgets,
              schemaProvider: new FlowSchemaProvider(visualEditorConfig.schema),
            }}
          >
            <div data-testid="visualdesigner-container" css={styles}>
              <ObiEditor
                key={dialogId}
                path={dialogId}
                data={data}
                focusedSteps={focusedActions}
                onFocusSteps={onFocusSteps}
                focusedEvent={focusedEvent}
                onFocusEvent={onFocusEvent}
                onClipboardChange={onCopy}
                onCreateDialog={createDialog}
                onOpen={x => navTo(x)}
                onChange={x => saveData(x)}
                onSelect={onSelect}
                undo={undo}
                redo={redo}
                announce={announce}
                addCoachMarkRef={addCoachMarkRef}
              />
            </div>
          </FlowSchemaContext.Provider>
        </SelfHostContext.Provider>
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

export default VisualDesigner;
