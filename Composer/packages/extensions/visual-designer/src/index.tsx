/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
  focusedSteps,
  focusedTab,
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
    navTo,
    onFocusEvent,
    onFocusSteps,
    onSelect,
    saveData,
    updateLgTemplate,
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
    });
  }, [focusedEvent, focusedSteps, focusedTab]);

  return (
    <CacheProvider value={emotionCache}>
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
    </CacheProvider>
  );
};

interface VisualDesignerProps {
  data: object;
  dialogId: string;
  focusedEvent: string;
  focusedSteps: string[];
  focusedTab: string;
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
  },
};

export default VisualDesigner;
