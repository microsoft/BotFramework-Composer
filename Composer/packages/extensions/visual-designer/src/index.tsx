// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import React, { useRef } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { ShellData, ShellApi, DialogFactory } from '@bfc/shared';

import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext, NodeRendererContextValue } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';
import { UISchemaContext } from './store/UISchemaContext';
import { UISchemaProvider } from './schema/uischemaProvider';
import { uiSchema } from './schema/uischema';
import { queryLgTemplateFromFiles } from './hooks/useLgTemplate';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

const visualEditorSchemaProvider = new UISchemaProvider(uiSchema);

const VisualDesigner: React.FC<VisualDesignerProps> = ({
  dialogId,
  focusedEvent,
  focusedActions,
  focusedTab,
  clipboardActions,
  data: inputData,
  shellApi,
  hosted,
  lgFiles,
  schema,
}): JSX.Element => {
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
  } = shellApi;

  const focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';

  const nodeContext: NodeRendererContextValue = {
    focusedId,
    focusedEvent,
    focusedTab,
    clipboardActions: clipboardActions || [],
    updateLgTemplate,
    getLgTemplateSync: (name: string) => queryLgTemplateFromFiles(name, lgFiles),
    getLgTemplates,
    copyLgTemplate: (id: string, from: string, to?: string) => copyLgTemplate(id, from, to).catch(() => undefined),
    removeLgTemplate,
    removeLgTemplates,
    removeLuIntent,
    dialogFactory: new DialogFactory(schema),
  };

  return (
    <CacheProvider value={emotionCache}>
      <NodeRendererContext.Provider value={nodeContext}>
        <SelfHostContext.Provider value={hosted}>
          <UISchemaContext.Provider value={visualEditorSchemaProvider}>
            <div data-testid="visualdesigner-container" css={{ width: '100%', height: '100%', overflow: 'scroll' }}>
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
                addCoachMarkRef={addCoachMarkRef}
              />
            </div>
          </UISchemaContext.Provider>
        </SelfHostContext.Provider>
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

export interface VisualDesignerProps extends ShellData {
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
  schema: any;
}

VisualDesigner.defaultProps = {
  dialogId: '',
  focusedEvent: '',
  focusedSteps: [],
  data: { $kind: '' },
  shellApi: ({
    navTo: () => {},
    onFocusEvent: () => {},
    onFocusSteps: () => {},
    onSelect: () => {},
    saveData: () => {},
    addCoachMarkRef: () => {},
  } as unknown) as ShellApi,
};

export default VisualDesigner;
