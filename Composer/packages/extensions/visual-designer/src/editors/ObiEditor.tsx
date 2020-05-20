// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC, useEffect, useRef } from 'react';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { KeyboardZone } from '../components/lib/KeyboardZone';
import { useKeyboardApi } from '../hooks/useKeyboardApi';
import { useSelectionApi } from '../hooks/useSelectionApi';
import { useEditorEventApi } from '../hooks/useEditorEventApi';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export const ObiEditor: FC<ObiEditorProps> = ({ path, data }): JSX.Element | null => {
  const { focusedEvent } = useContext(NodeRendererContext);
  const { selection } = useSelectionApi();
  const { handleEditorEvent } = useEditorEventApi();
  const { handleKeyboardCommand } = useKeyboardApi();
  const divRef = useRef<HTMLDivElement>(null);

  // send focus to the keyboard area when navigating to a new trigger
  useEffect(() => {
    divRef.current?.focus();
  }, [focusedEvent]);

  // HACK: use global handler before we solve iframe state sync problem
  (window as any).copySelection = () => handleEditorEvent(NodeEventTypes.CopySelection);
  (window as any).cutSelection = () => handleEditorEvent(NodeEventTypes.CutSelection);
  (window as any).moveSelection = () => handleEditorEvent(NodeEventTypes.MoveSelection);
  (window as any).deleteSelection = () => handleEditorEvent(NodeEventTypes.DeleteSelection);

  if (!data) return null;
  return (
    <KeyboardZone onCommand={handleKeyboardCommand} ref={divRef}>
      <MarqueeSelection selection={selection} css={{ width: '100%', height: '100%' }}>
        <div
          className="obi-editor-container"
          data-testid="obi-editor-container"
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
            id={path}
            data={data}
            onEvent={(eventName, eventData) => {
              divRef.current?.focus({ preventScroll: true });
              handleEditorEvent(eventName, eventData);
            }}
          />
        </div>
      </MarqueeSelection>
    </KeyboardZone>
  );
};

ObiEditor.defaultProps = {
  path: '.',
  data: {},
};

interface ObiEditorProps {
  path: string;
  // Obi raw json
  data: any;
}
