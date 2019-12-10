// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import React, { useRef } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { ShellData, ShellApi } from '@bfc/shared';

import { VisualEditor } from './containers/VisualEditor';
import { NodeRendererContext } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';
import useStore from './store/useStore';
import resetStore from './actions/resetDialog';
import { StoreContext } from './store/StoreContext';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

const ComposerVisualDesigner: React.FC<ComposerVisualDesignerProps> = ({
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

  const { state, dispatch } = useStore();

  /**
   * VisualDesigner is coupled with ShellApi where input json always mutates.
   * Deep checking input data here to make React change detection works.
   */
  const dataChanged = !isEqual(dataCache.current, inputData);
  if (dataChanged) {
    dispatch(
      resetStore({
        dialog: {
          id: dialogId,
          json: inputData,
        },
        clipboardActions,
      })
    );
    dataCache.current = inputData;
  }

  const {
    addCoachMarkRef,
    updateLgTemplate,
    getLgTemplates,
    copyLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
  } = shellApi;

  const focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';

  const nodeContext = {
    focusedId,
    focusedEvent,
    focusedTab,
    clipboardActions: clipboardActions || [],
    updateLgTemplate,
    getLgTemplates,
    copyLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
  };

  return (
    <CacheProvider value={emotionCache}>
      <StoreContext.Provider value={{ state, dispatch }}>
        <NodeRendererContext.Provider value={nodeContext}>
          <SelfHostContext.Provider value={hosted} /** selfhost only influences the edge menu */>
            <div data-testid="visualdesigner-container" css={{ width: '100%', height: '100%', overflow: 'scroll' }}>
              <VisualEditor key={dialogId} addCoachMarkRef={addCoachMarkRef} />
            </div>
          </SelfHostContext.Provider>
        </NodeRendererContext.Provider>
      </StoreContext.Provider>
    </CacheProvider>
  );
};

interface ComposerVisualDesignerProps extends ShellData {
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
}

ComposerVisualDesigner.defaultProps = {
  dialogId: '',
  focusedEvent: '',
  focusedSteps: [],
  data: { $type: '' },
  shellApi: ({
    navTo: () => null,
    onFocusEvent: () => null,
    onFocusSteps: () => null,
    onSelect: () => null,
    saveData: () => null,
    addCoachMarkRef: () => null,
  } as unknown) as ShellApi,
};

export default ComposerVisualDesigner;
