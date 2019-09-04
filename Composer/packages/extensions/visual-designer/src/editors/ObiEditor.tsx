/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC, useEffect, useState, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { deleteNode, insert } from '../utils/jsonTracker';
import { moveFocusNode } from '../utils/cursorTraker';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectionContext, SelectionContextData } from '../store/SelectionContext';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { KeyboardZone } from '../components/lib/KeyboardZone';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export const ObiEditor: FC<ObiEditorProps> = ({
  path,
  data,
  onFocusEvent,
  onFocusSteps,
  onOpen,
  onChange,
}): JSX.Element | null => {
  let divRef;

  const { focusedId, removeLgTemplate } = useContext(NodeRendererContext);

  const dispatchEvent = (eventName: NodeEventTypes, eventData: any): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        resetSelectionData();
        handler = id => onFocusSteps(id ? [id] : []);
        break;
      case NodeEventTypes.FocusEvent:
        handler = onFocusEvent;
        break;
      case NodeEventTypes.OpenDialog:
        handler = ({ caller, callee }) => onOpen(callee, caller);
        break;
      case NodeEventTypes.Delete:
        handler = e => {
          const cleanLgTemplate = (removedData: any): void => {
            if (removedData && removedData.$type === 'Microsoft.SendActivity') {
              if (removedData.activity && removedData.activity.indexOf('[bfdactivity-') !== -1) {
                removeLgTemplate('common', removedData.activity.slice(1, removedData.activity.length - 1));
              }
            }
          };
          onChange(deleteNode(data, e.id, cleanLgTemplate));
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.Insert:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onFocusSteps([`${e.id}[${e.position || 0}]`]);
        };
        break;
      case NodeEventTypes.InsertEvent:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onFocusEvent(`${e.id}[${e.position || 0}]`);
        };
        break;
      default:
        handler = onFocusSteps;
        break;
    }
    return handler(eventData);
  };

  const renderFallbackContent = () => {
    return null;
  };

  const resetSelectionData = () => {
    nodeIndexGenerator.current.reset();
    setSelectionContext({
      getNodeIndex: selectionContext.getNodeIndex,
      selectedIds: [],
    });
  };
  const nodeIndexGenerator = useRef(new NodeIndexGenerator());
  const nodeItems = nodeIndexGenerator.current.getItemList();
  const [selectionContext, setSelectionContext] = useState<SelectionContextData>({
    getNodeIndex: (nodeId: string): number => nodeIndexGenerator.current.getNodeIndex(nodeId),
    selectedIds: [],
  });

  const [keyboardStatus, setKeyBoardStatus] = useState('normal');

  useEffect(
    (): void => {
      selection.setItems(nodeIndexGenerator.current.getItemList());
    }
  );

  useEffect((): void => {
    resetSelectionData();
  }, [data]);

  useEffect((): void => {
    if (selectionContext.selectedIds.length > 0) {
      setKeyBoardStatus('selected');
    } else if (focusedId) {
      setKeyBoardStatus('focused');
    } else {
      setKeyBoardStatus('nomal');
    }
  }, [focusedId, selectionContext]);

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);
      const newContext = {
        getNodeIndex: selectionContext.getNodeIndex,
        selectedIds,
      };
      console.log(selectedIds);
      setSelectionContext(newContext);
    },
  });

  const handleKeyboardCommand = command => {
    let path = focusedId;
    const idSelectors = focusedId.split('.');
    switch (command) {
      case KeyboardCommandTypes.MoveUp:
      case KeyboardCommandTypes.MoveDown:
      case KeyboardCommandTypes.MoveLeft:
      case KeyboardCommandTypes.MoveRight:
        path = moveFocusNode(data, focusedId, command);
        onFocusSteps([path]);
        break;
      case KeyboardCommandTypes.DeleteNode:
        dispatchEvent(NodeEventTypes.Delete, { id: focusedId });
        break;
    }
  };

  if (!data) return renderFallbackContent();
  return (
    <SelectionContext.Provider value={selectionContext}>
      <KeyboardZone onCommand={handleKeyboardCommand} when={keyboardStatus}>
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
            onKeyUp={e => {
              const keyString = e.key;
              if (keyString === 'Delete' && focusedId) {
                dispatchEvent(NodeEventTypes.Delete, { id: focusedId });
              }
            }}
            onClick={e => {
              e.stopPropagation();
              dispatchEvent(NodeEventTypes.Focus, '');
            }}
          >
            <AdaptiveDialogEditor
              id={path}
              data={data}
              onEvent={(eventName, eventData) => {
                divRef.focus({ preventScroll: true });
                dispatchEvent(eventName, eventData);
              }}
            />
          </div>
        </MarqueeSelection>
      </KeyboardZone>
    </SelectionContext.Provider>
  );
};

ObiEditor.defaultProps = {
  path: '.',
  data: {},
  focusedSteps: [],
  onFocusSteps: () => {},
  focusedEvent: '',
  onFocusEvent: () => {},
  onOpen: () => {},
  onChange: () => {},
};

interface ObiEditorProps {
  path: string;
  // Obi raw json
  data: any;
  focusedSteps: string[];
  onFocusSteps: (stepIds: string[]) => any;
  focusedEvent: string;
  onFocusEvent: (eventId: string) => any;
  onOpen: (calleeDialog: string, callerId: string) => any;
  onChange: (newDialog: any) => any;
}
