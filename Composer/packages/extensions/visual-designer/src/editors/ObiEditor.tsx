/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC, useEffect, useState, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { ObiTypes } from '../constants/ObiTypes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectionContext, SelectionContextData } from '../store/SelectionContext';
import { ClipboardContext } from '../store/ClipboardContext';
import {
  deleteNode,
  insert,
  cutNodes,
  copyNodes,
  appendNodesAfter,
  pasteNodes,
  deleteNodes,
} from '../utils/jsonTracker';
import { moveCursor } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { normalizeSelection } from '../utils/normalizeSelection';
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

  const { focusedId, focusedEvent, removeLgTemplate } = useContext(NodeRendererContext);
  const [clipboardContext, setClipboardContext] = useState({
    clipboardActions: [],
    setClipboardActions: actions => setClipboardContext({ ...clipboardContext, clipboardActions: actions }),
  });

  const dispatchEvent = (eventName: NodeEventTypes, eventData: any): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = id => {
          const newFocusedIds = id ? [id] : [];
          setSelectionContext({
            ...selectionContext,
            selectedIds: [...newFocusedIds],
          });
          onFocusSteps([...newFocusedIds]);
        };
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
            if (removedData && removedData.$type === ObiTypes.SendActivity) {
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
        if (eventData.$type === 'PASTE') {
          handler = e => {
            const dialog = pasteNodes(data, e.id, e.position, clipboardContext.clipboardActions);
            onChange(dialog);
          };
        } else {
          handler = e => {
            const dialog = insert(data, e.id, e.position, e.$type);
            onChange(dialog);
            onFocusSteps([`${e.id}[${e.position || 0}]`]);
          };
        }
        break;
      case NodeEventTypes.InsertEvent:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onFocusEvent(`${e.id}[${e.position || 0}]`);
        };
        break;
      case NodeEventTypes.CopySelection:
        handler = e => {
          const copiedActions = copyNodes(data, e.actionIds);
          clipboardContext.setClipboardActions(copiedActions);
        };
        break;
      case NodeEventTypes.CutSelection:
        handler = e => {
          const { dialog, cutData } = cutNodes(data, e.actionIds);
          clipboardContext.setClipboardActions(cutData);
          onChange(dialog);
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.DeleteSelection:
        handler = e => {
          const dialog = deleteNodes(data, e.actionIds);
          onChange(dialog);
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.AppendSelection:
        handler = e => {
          // forbid paste to root level.
          if (!e.target || e.target === focusedEvent) return;
          const dialog = appendNodesAfter(data, e.target, e.actions);
          onChange(dialog);
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

  useEffect((): void => {
    if (selectionContext.selectedIds.length > 0) {
      setKeyBoardStatus('selected');
    } else if (focusedId) {
      setKeyBoardStatus('focused');
    } else {
      setKeyBoardStatus('normal');
    }

    onChange(data);
  }, [focusedId, selectionContext]);

  useEffect(
    (): void => {
      selection.setItems(nodeIndexGenerator.current.getItemList());
    }
  );

  useEffect((): void => {
    resetSelectionData();
    setSelectedElements(querySelectedElements());
  }, [data]);

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);

      setSelectionContext({
        ...selectionContext,
        selectedIds,
      });
    },
  });

  const querySelectedElements = () => {
    const items: NodeListOf<HTMLElement> = document.querySelectorAll(`[${AttrNames.SelectableElement}]`);
    return items;
  };
  const [selectedElements, setSelectedElements] = useState<NodeListOf<HTMLElement>>(querySelectedElements());

  const getClipboardTargetsFromContext = (): string[] => {
    const selectedActionIds = normalizeSelection(selectionContext.selectedIds);
    if (selectedActionIds.length === 0 && focusedId) {
      selectedActionIds.push(focusedId);
    }
    return selectedActionIds;
  };

  // HACK: use global handler before we solve iframe state sync problem
  (window as any).hasElementFocused = () => !!focusedId && focusedId !== focusedEvent;
  (window as any).hasElementSelected = () =>
    !!(selectionContext && selectionContext.selectedIds && selectionContext.selectedIds.length) ||
    (window as any).hasElementFocused();

  (window as any).copySelection = () =>
    dispatchEvent(NodeEventTypes.CopySelection, { actionIds: getClipboardTargetsFromContext() });
  (window as any).cutSelection = () =>
    dispatchEvent(NodeEventTypes.CutSelection, { actionIds: getClipboardTargetsFromContext() });
  (window as any).deleteSelection = () =>
    dispatchEvent(NodeEventTypes.DeleteSelection, { actionIds: getClipboardTargetsFromContext() });

  const handleKeyboardCommand = ({ area, command }) => {
    const currentSelectedId = selectionContext.selectedIds[0];
    switch (area) {
      case KeyboardPrimaryTypes.Node:
        switch (command) {
          case KeyboardCommandTypes.Node.Delete:
            dispatchEvent(NodeEventTypes.DeleteSelection, { actionIds: getClipboardTargetsFromContext() });
            break;
          case KeyboardCommandTypes.Node.Copy:
            dispatchEvent(NodeEventTypes.CopySelection, { actionIds: getClipboardTargetsFromContext() });
            break;
          case KeyboardCommandTypes.Node.Cut:
            dispatchEvent(NodeEventTypes.CutSelection, { actionIds: getClipboardTargetsFromContext() });
            break;
          case KeyboardCommandTypes.Node.Paste:
            dispatchEvent(NodeEventTypes.AppendSelection, {
              target: focusedId,
              actions: clipboardContext.clipboardActions,
            });
            break;
        }
        break;
      case KeyboardPrimaryTypes.Cursor: {
        const { selected, focused } = moveCursor(selectedElements, currentSelectedId, command);
        setSelectionContext({
          getNodeIndex: selectionContext.getNodeIndex,
          selectedIds: [selected as string],
        });
        focused && onFocusSteps([focused]);
        break;
      }
      default:
        break;
    }
  };
  if (!data) return renderFallbackContent();
  return (
    <SelectionContext.Provider value={selectionContext}>
      <ClipboardContext.Provider value={clipboardContext}>
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
      </ClipboardContext.Provider>
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
