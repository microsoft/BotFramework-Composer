// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import React, { useRef, useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import formatMessage from 'format-message';

import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

const VisualDesigner: React.FC<VisualDesignerProps> = ({
  dialogId,
  focusedEvent,
  focusedActions,
  focusedTab,
  clipboardActions,
  data: inputData,
  shellApi,
  hosted,
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
    updateLgTemplate,
    getLgTemplates,
    removeLgTemplate,
    undo,
    redo,
  } = shellApi;

  const focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';

  // NOTE: avoid re-render. https://reactjs.org/docs/context.html#caveats
  const [context, setContext] = useState({
    focusedId,
    focusedEvent,
    focusedTab,
    clipboardActions: clipboardActions || [],
    updateLgTemplate: updateLgTemplate,
    getLgTemplates: getLgTemplates,
    removeLgTemplate: removeLgTemplate,
  });

  useEffect(() => {
    setContext({
      ...context,
      focusedId,
      focusedEvent,
      focusedTab,
      clipboardActions,
    });
  }, [focusedEvent, focusedActions, focusedTab, clipboardActions]);

  return (
    <CacheProvider value={emotionCache}>
      <NodeRendererContext.Provider value={context}>
        <SelfHostContext.Provider value={hosted}>
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
              onOpen={(x, rest) => navTo(x, rest)}
              onChange={x => saveData(x)}
              onSelect={onSelect}
              undo={undo}
              redo={redo}
              addCoachMarkRef={addCoachMarkRef}
            />
          </div>
        </SelfHostContext.Provider>
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

interface VisualDesignerProps {
  data: object;
  dialogId: string;
  focusedEvent: string;
  focusedActions: string[];
  focusedSteps: string[];
  focusedTab: string;
  clipboardActions: any[];
  shellApi: any;
  hosted: boolean;
  currentDialog: { id: string; displayName: string; isRoot: boolean };
}

VisualDesigner.defaultProps = {
  dialogId: '',
  focusedEvent: '',
  focusedSteps: [],
  data: {},
  shellApi: {
    navTo: () => {},
    onFocusEvent: (_eventId: string) => {},
    onFocusSteps: (_stepIds: string[], _fragment?: string) => {},
    onSelect: (_ids: string[]) => {},
    saveData: () => {},
    addCoachMarkRef: (_: any) => {},
  },
};

export default VisualDesigner;
