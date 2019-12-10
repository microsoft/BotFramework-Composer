// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext, useEffect, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { KeyboardZone } from '../components/lib/KeyboardZone';
import setFocusState from '../actions/setFocusState';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { StoreContext } from '../store/StoreContext';
import { StoreState } from '../store/store';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import mapEditorEventToAction from './mapEditorEventToAction';
import mapShortcutToEditorEvent from './mapShortcutToEditorEvent';
import { AdaptiveDialogEditor, AdaptiveDialogEditorProps } from './AdaptiveDialogEditor';

const mapStateToEditorProps = (state: StoreState): AdaptiveDialogEditorProps => {
  const { dialog, eventPath, focusedId, focusedTab, selectedIds } = state;
  return {
    dialogId: dialog.id,
    dialogData: dialog.json,
    focusedEvent: eventPath,
    focusedAction: focusedId,
    focusedTab,
    selectedIds,
  };
};

/**
 * Visual Editor is a custmized version of EventEditor used by Composer.
 * Provides two more features: drag selection, keyboard navigation.
 */
export const VisualEditor: FC<VisualDesignerProps> = ({ addCoachMarkRef }): JSX.Element | null => {
  let divRef;

  const { state: store, dispatch } = useContext(StoreContext);

  const mapEditorEventToHandler = (eventName: NodeEventTypes) => {
    let handler;
    // dialog json indexer;
    return handler;
  };

  const handleEditorEvent = (eventName, eventData) => {
    const action = mapEditorEventToAction(eventName, eventData, store);
    if (action) {
      dispatch(action);
      return;
    }

    const eventHandler = mapEditorEventToHandler(eventName);
    if (eventHandler) {
      eventHandler(eventData);
    }
  };

  const handleKeyboardCommand = command => {
    const e = mapShortcutToEditorEvent(command);
    if (e) {
      handleEditorEvent(e.eventName, e.eventData);
    }
  };

  const nodeIndexGenerator = useRef(new NodeIndexGenerator());
  const nodeItems = nodeIndexGenerator.current.getItemList();
  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);

      if (selectedIds.length === 1) {
        handleEditorEvent(NodeEventTypes.Focus, { id: selectedIds[0] });
      }
      handleEditorEvent(NodeEventTypes.Select, selectedIds);
    },
  });

  useEffect(() => {
    selection.setItems(nodeIndexGenerator.current.getItemList());
  });

  if (!store.dialog.json) return null;
  return (
    <KeyboardZone onCommand={handleKeyboardCommand}>
      <MarqueeSelection selection={selection} css={{ width: '100%', height: '100%' }}>
        <div
          tabIndex={0}
          className="obi-editor-container"
          data-testid="obi-editor-container"
          css={{
            width: '100%',
            height: '100%',
            padding: '48px 20px',
            boxSizing: 'border-box',
            '&:focus': { outline: 'none' },
          }}
          ref={el => (divRef = el)}
          onClick={e => {
            e.stopPropagation();
            dispatch(setFocusState(''));
          }}
        >
          <AdaptiveDialogEditor
            {...mapStateToEditorProps(store)}
            generateTabIndex={(nodeId: string) => nodeIndexGenerator.current.getNodeIndex(nodeId)}
            onEvent={(eventName, eventData) => {
              divRef.focus({ preventScroll: true });
              handleEditorEvent(eventName, eventData);
            }}
          />
        </div>
      </MarqueeSelection>
    </KeyboardZone>
  );
};

VisualEditor.defaultProps = {
  addCoachMarkRef: () => null,
};

interface VisualDesignerProps {
  addCoachMarkRef?: (_: any) => void;
}
