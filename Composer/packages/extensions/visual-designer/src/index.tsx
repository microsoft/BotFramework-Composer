/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import formatMessage from 'format-message';

import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext } from './store/NodeRendererContext';
import { SelfHostContext } from './store/SelfHostContext';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const VisualDesigner: React.FC<VisualDesignerProps> = ({
  dialogId,
  focusedEvent,
  focusedSteps,
  focusedTab,
  data: inputData,
  shellApi,
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
    navTo,
    onFocusEvent,
    onFocusSteps,
    onSelect,
    saveData,
    getLgTemplates,
    removeLgTemplate,
    undo,
    redo,
  } = shellApi;

  const focusedId = Array.isArray(focusedSteps) && focusedSteps[0] ? focusedSteps[0] : '';

  // NOTE: avoid re-render. https://reactjs.org/docs/context.html#caveats
  const [context, setContext] = useState({
    focusedId,
    focusedEvent,
    focusedTab,
    getLgTemplates: getLgTemplates,
    removeLgTemplate: removeLgTemplate,
  });
  const hosted = window.parent!.document!.getElementById('VisualEditor')!.dataset.hosted === 'true';
  useEffect(() => {
    setContext({
      ...context,
      focusedId,
      focusedEvent,
      focusedTab,
    });
  }, [focusedEvent, focusedSteps, focusedTab]);

  return (
    <NodeRendererContext.Provider value={context}>
      <SelfHostContext.Provider value={hosted}>
        <div data-testid="visualdesigner-container" css={{ width: '100%', height: '100%', overflow: 'scroll' }}>
          <ObiEditor
            key={dialogId}
            path={dialogId}
            data={data}
            focusedSteps={focusedSteps}
            onFocusSteps={onFocusSteps}
            focusedEvent={focusedEvent}
            onFocusEvent={onFocusEvent}
            onOpen={(x, rest) => navTo(x, rest)}
            onChange={x => saveData(x)}
            onSelect={onSelect}
            undo={undo}
            redo={redo}
          />
        </div>
      </SelfHostContext.Provider>
    </NodeRendererContext.Provider>
  );
};

interface VisualDesignerProps {
  data: object;
  dialogId: string;
  focusedEvent: string;
  focusedSteps: string[];
  focusedTab: string;
  shellApi: any;
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
  },
};

export default VisualDesigner;
