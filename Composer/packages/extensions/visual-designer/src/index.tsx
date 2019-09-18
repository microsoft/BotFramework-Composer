/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import formatMessage from 'format-message';

import { ObiEditor } from './editors/ObiEditor';
import { NodeRendererContext } from './store/NodeRendererContext';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const VisualDesigner: React.FC<VisualDesignerProps> = ({
  dialogId,
  focusedEvent,
  focusedSteps,
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
  const { navTo, onFocusEvent, onFocusSteps, saveData, getLgTemplates, removeLgTemplate } = shellApi;

  const focusedId = Array.isArray(focusedSteps) && focusedSteps[0] ? focusedSteps[0] : '';

  // NOTE: avoid re-render. https://reactjs.org/docs/context.html#caveats
  const [context, setContext] = useState({
    focusedId,
    focusedEvent,
    getLgTemplates: getLgTemplates,
    removeLgTemplate: removeLgTemplate,
  });

  useEffect(() => {
    setContext({
      ...context,
      focusedId,
      focusedEvent,
    });
  }, [focusedEvent, focusedSteps]);

  return (
    <NodeRendererContext.Provider value={context}>
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
        />
      </div>
    </NodeRendererContext.Provider>
  );
};

interface VisualDesignerProps {
  data: object;
  dialogId: string;
  focusedEvent: string;
  focusedSteps: string[];
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
    onFocusEvent: (eventId: string) => {},
    onFocusSteps: (stepIds: string[]) => {},
    saveData: () => {},
  },
};

export default VisualDesigner;
