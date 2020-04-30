// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC, useEffect, useState, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { SDKKinds, DialogUtils } from '@bfc/shared';
import { useDialogApi, useDialogEditApi, useActionApi, useShellApi } from '@bfc/extension';
import get from 'lodash/get';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { ScreenReaderMessage } from '../constants/ScreenReaderMessage';
import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectionContext, SelectionContextData } from '../store/SelectionContext';
import { moveCursor, querySelectableElements, SelectorElement } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { normalizeSelection } from '../utils/normalizeSelection';
import { KeyboardZone } from '../components/lib/KeyboardZone';
import { scrollNodeIntoView } from '../utils/nodeOperation';
import { designerCache } from '../store/DesignerCache';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export const ObiEditor: FC<ObiEditorProps> = ({
  path,
  data,
  onFocusEvent,
  onFocusSteps,
  onClipboardChange,
  onOpen,
  onChange,
  onSelect,
  undo,
  redo,
  announce,
  addCoachMarkRef,
}): JSX.Element | null => {
  let divRef;

  const { focusedId, focusedEvent, clipboardActions, dialogFactory } = useContext(NodeRendererContext);
  const { shellApi } = useShellApi();
  const {
    insertAction,
    insertActions,
    insertActionsAfter,
    copySelectedActions,
    cutSelectedActions,
    deleteSelectedAction,
    deleteSelectedActions,
    updateRecognizer,
  } = useDialogEditApi(shellApi);
  const { createDialog, readDialog, updateDialog } = useDialogApi(shellApi);
  const { actionsContainLuIntent } = useActionApi(shellApi);

  const trackActionChange = (actionPath: string) => {
    const affectedPaths = DialogUtils.getParentPaths(actionPath);
    for (const path of affectedPaths) {
      const json = get(data, path);
      designerCache.uncacheBoundary(json);
    }
  };

  const trackActionListChange = (actionPaths: string[]) => {
    if (!Array.isArray(actionPaths)) return;
    actionPaths.forEach(x => trackActionChange(x));
  };

  const dispatchEvent = (eventName: NodeEventTypes, eventData: any): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = (e: { id: string; tab?: string }) => {
          const newFocusedIds = e.id ? [e.id] : [];
          setSelectionContext({
            ...selectionContext,
            selectedIds: [...newFocusedIds],
          });
          onFocusSteps([...newFocusedIds], e.tab);
          announce(ScreenReaderMessage.ActionFocused);
        };
        break;
      case NodeEventTypes.FocusEvent:
        handler = eventData => {
          onFocusEvent(eventData);
          announce(ScreenReaderMessage.EventFocused);
        };
        break;
      case NodeEventTypes.OpenDialog:
        handler = ({ caller, callee }) => {
          onOpen(callee, caller);
          announce(ScreenReaderMessage.DialogOpened);
        };
        break;
      case NodeEventTypes.Delete:
        trackActionChange(eventData.id);
        handler = e => {
          onChange(deleteSelectedAction(path, data, e.id));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionDeleted);
        };
        break;
      case NodeEventTypes.Insert:
        trackActionChange(eventData.id);
        if (eventData.$kind === 'PASTE') {
          handler = e => {
            insertActions(path, data, e.id, e.position, clipboardActions).then(dialog => {
              onChange(dialog);
              onFocusSteps([`${e.id}[${e.position || 0}]`]);
            });
            announce(ScreenReaderMessage.ActionCreated);
          };
        } else {
          handler = e => {
            const newAction = dialogFactory.create(e.$kind);
            insertAction(path, data, e.id, e.position, newAction).then(dialog => {
              onChange(dialog);
              onFocusSteps([`${e.id}[${e.position || 0}]`]);
              announce(ScreenReaderMessage.ActionCreated);
            });
          };
        }
        break;
      case NodeEventTypes.CopySelection:
        handler = e => {
          copySelectedActions(path, data, e.actionIds).then(copiedNodes => onClipboardChange(copiedNodes));
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        trackActionListChange(eventData.actionIds);
        handler = e => {
          cutSelectedActions(path, data, e.actionIds).then(({ dialog, cutActions }) => {
            onChange(dialog);
            onFocusSteps([]);
            onClipboardChange(cutActions);
          });
          announce(ScreenReaderMessage.ActionsCut);
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = async e => {
          if (!Array.isArray(e.actionIds) || !e.actionIds.length) return;

          // Create target dialog
          const newDialogId = await createDialog();
          if (!newDialogId) return;
          let newDialogData = readDialog(newDialogId);

          // Using copy->paste->delete pattern is safer than using cut->paste
          const actionsToBeMoved = await copySelectedActions(path, data, e.actionIds);
          newDialogData = await insertActions(
            newDialogId,
            newDialogData,
            `${'triggers'}[0].${'actions'}`,
            0,
            actionsToBeMoved
          );
          if (actionsContainLuIntent(actionsToBeMoved)) {
            // auto assign recognizer type to lu
            newDialogData = updateRecognizer(path, newDialogData, `${newDialogId}.lu`);
          }
          updateDialog(newDialogId, newDialogData);

          // Delete moved actions
          const deleteResult = deleteSelectedActions(path, data, e.actionIds);

          // Insert a BeginDialog as placeholder
          const placeholderPosition = DialogUtils.parseNodePath(e.actionIds[0]);
          if (!placeholderPosition) return;

          const placeholderAction = dialogFactory.create(SDKKinds.BeginDialog, { dialog: newDialogId });
          const insertResult = await insertAction(
            path,
            deleteResult,
            placeholderPosition.arrayPath,
            placeholderPosition.arrayIndex,
            placeholderAction
          );
          onChange(insertResult);
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionsMoved);
        };
        break;
      case NodeEventTypes.DeleteSelection:
        trackActionListChange(eventData.actionIds);
        handler = e => {
          onChange(deleteSelectedActions(path, data, e.actionIds));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionsDeleted);
        };
        break;
      case NodeEventTypes.AppendSelection:
        trackActionListChange(eventData.target);
        handler = e => {
          // forbid paste to root level.
          if (!e.target || e.target === focusedEvent) return;
          onChange(insertActionsAfter(path, data, e.target, e.actions));
          announce(ScreenReaderMessage.ActionsCreated);
        };
        break;
      case NodeEventTypes.Undo:
        handler = () => {
          undo?.();
          announce(ScreenReaderMessage.ActionUndo);
        };
        break;
      case NodeEventTypes.Redo:
        handler = () => {
          redo?.();
          announce(ScreenReaderMessage.ActionUndo);
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

  useEffect((): void => {
    // Notify container at every selection change.
    onSelect(selectionContext.selectedIds.length ? selectionContext.selectedIds : focusedId ? [focusedId] : []);
  }, [focusedId, selectionContext]);

  useEffect((): void => {
    selection.setItems(nodeIndexGenerator.current.getItemList());
  });

  useEffect((): void => {
    resetSelectionData();
    setSelectableElements(querySelectableElements());
  }, [data, focusedEvent]);

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);

      if (selectedIds.length === 1) {
        // TODO: Change to focus all selected nodes after Form Editor support showing multiple nodes.
        onFocusSteps(selectedIds);
      }

      setSelectionContext({
        ...selectionContext,
        selectedIds,
      });
    },
  });

  const [selectableElements, setSelectableElements] = useState<SelectorElement[]>(querySelectableElements());

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
  (window as any).moveSelection = () =>
    dispatchEvent(NodeEventTypes.MoveSelection, { actionIds: getClipboardTargetsFromContext() });
  (window as any).deleteSelection = () =>
    dispatchEvent(NodeEventTypes.DeleteSelection, { actionIds: getClipboardTargetsFromContext() });

  const handleKeyboardCommand = ({ area, command }) => {
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
          case KeyboardCommandTypes.Node.Paste: {
            const currentSelectedId = selectionContext.selectedIds[0];
            if (currentSelectedId.endsWith('+')) {
              const { arrayPath, arrayIndex } = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {};
              dispatchEvent(NodeEventTypes.Insert, {
                id: arrayPath,
                position: arrayIndex,
                $kind: 'PASTE',
              });
            }
            break;
          }
        }
        break;
      case KeyboardPrimaryTypes.Cursor: {
        const currentSelectedId = selectionContext.selectedIds[0] || focusedId || '';
        const { selected, focused, tab } = moveCursor(selectableElements, currentSelectedId, command);
        setSelectionContext({
          getNodeIndex: selectionContext.getNodeIndex,
          selectedIds: [selected as string],
        });
        focused && onFocusSteps([focused], tab);
        scrollNodeIntoView(`[${AttrNames.SelectedId}="${selected}"]`);
        announce(ScreenReaderMessage.ActionFocused);
        break;
      }
      case KeyboardPrimaryTypes.Operation: {
        switch (command) {
          case KeyboardCommandTypes.Operation.Undo:
            dispatchEvent(NodeEventTypes.Undo, {});
            break;
          case KeyboardCommandTypes.Operation.Redo:
            dispatchEvent(NodeEventTypes.Redo, {});
            break;
        }
        break;
      }
      default:
        break;
    }
  };
  if (!data) return renderFallbackContent();
  return (
    <SelectionContext.Provider value={selectionContext}>
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
              dispatchEvent(NodeEventTypes.Focus, { id: '' });
            }}
          >
            <AdaptiveDialogEditor
              id={path}
              data={data}
              onEvent={(eventName, eventData) => {
                divRef.focus({ preventScroll: true });
                dispatchEvent(eventName, eventData);
              }}
              addCoachMarkRef={addCoachMarkRef}
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
  onClipboardChange: () => {},
  onOpen: () => {},
  onChange: () => {},
  onSelect: () => {},
  undo: () => {},
  redo: () => {},
  announce: (message: string) => {},
  addCoachMarkRef: () => {},
};

interface ObiEditorProps {
  path: string;
  // Obi raw json
  data: any;
  focusedSteps: string[];
  onFocusSteps: (stepIds: string[], fragment?: string) => any;
  focusedEvent: string;
  onFocusEvent: (eventId: string) => any;
  onClipboardChange: (actions: any[]) => void;
  onCreateDialog: (actions: any[]) => Promise<string | null>;
  onOpen: (calleeDialog: string, callerId: string) => any;
  onChange: (newDialog: any) => any;
  onSelect: (ids: string[]) => any;
  undo?: () => any;
  redo?: () => any;
  announce: (message: string) => any;
  addCoachMarkRef?: (ref: { [key: string]: HTMLDivElement }) => void;
}
