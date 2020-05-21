// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogUtils, SDKKinds } from '@bfc/shared';
import get from 'lodash/get';
import { useDialogEditApi, useShellApi, useDialogApi, useActionApi } from '@bfc/extension';
import { useContext } from 'react';

import { designerCache } from '../store/DesignerCache';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { ScreenReaderMessage } from '../constants/ScreenReaderMessage';
import { scrollNodeIntoView } from '../utils/nodeOperation';
import { MenuEventTypes, MenuTypes } from '../constants/MenuTypes';
import { normalizeSelection } from '../utils/normalizeSelection';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { moveCursor } from '../utils/cursorTracker';

import { useSelectionEffect } from './useSelectionEffect';

// TODO(ze): useEditorEvent api is almost a reducer, consider transforming it to a useReducer.
export const useEditorEventApi = () => {
  const { shellApi, dialogId: path, data } = useShellApi();
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
  const { focusedId, focusedEvent, clipboardActions, dialogFactory } = useContext(NodeRendererContext);
  const { selectedIds, setSelectedIds, selectableElements } = useSelectionEffect();

  const {
    onFocusSteps,
    onFocusEvent,
    onCopy: onClipboardChange,
    navTo: onOpen,
    saveData: onChange,
    undo,
    redo,
    announce,
  } = shellApi;

  const getClipboardTargetsFromContext = (): string[] => {
    const selectedActionIds = normalizeSelection(selectedIds);
    if (selectedActionIds.length === 0 && focusedId) {
      selectedActionIds.push(focusedId);
    }
    return selectedActionIds;
  };

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

  const handleEditorEvent = (eventName: NodeEventTypes, eventData: any = {}): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = (e: { id: string; tab?: string }) => {
          const newFocusedIds = e.id ? [e.id] : [];
          setSelectedIds([...newFocusedIds]);
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
      case NodeEventTypes.MoveCursor:
        handler = eventData => {
          const { command } = eventData;
          const currentSelectedId = selectedIds[0] || focusedId || '';
          const cursor = currentSelectedId
            ? moveCursor(selectableElements, currentSelectedId, command)
            : {
                selected: `${focusedEvent}.actions[0]${MenuTypes.EdgeMenu}`,
                focused: undefined,
                tab: '',
              };
          const { focused, selected, tab } = cursor;
          setSelectedIds([selected as string]);
          focused && onFocusSteps([focused], tab);
          scrollNodeIntoView(`[${AttrNames.SelectedId}="${selected}"]`);
          announce(ScreenReaderMessage.ActionFocused);
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
        if (eventData.$kind === MenuEventTypes.Paste) {
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
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          copySelectedActions(path, data, actionIds).then(copiedNodes => onClipboardChange(copiedNodes));
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          cutSelectedActions(path, data, actionIds).then(({ dialog, cutActions }) => {
            onChange(dialog);
            onFocusSteps([]);
            onClipboardChange(cutActions);
          });
          announce(ScreenReaderMessage.ActionsCut);
        };
        break;
      case NodeEventTypes.PasteSelection:
        handler = () => {
          const currentSelectedId = selectedIds[0];
          if (currentSelectedId.endsWith('+')) {
            const { arrayPath, arrayIndex } = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {};
            handleEditorEvent(NodeEventTypes.Insert, {
              id: arrayPath,
              position: arrayIndex,
              $kind: MenuEventTypes.Paste,
            });
          }
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = async () => {
          const actionIds = getClipboardTargetsFromContext();
          if (!Array.isArray(actionIds) || !actionIds.length) return;

          // Create target dialog
          const newDialogId = await createDialog();
          if (!newDialogId) return;
          let newDialogData = readDialog(newDialogId);

          // Using copy->paste->delete pattern is safer than using cut->paste
          const actionsToBeMoved = await copySelectedActions(path, data, actionIds);
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
          const deleteResult = deleteSelectedActions(path, data, actionIds);

          // Insert a BeginDialog as placeholder
          const placeholderPosition = DialogUtils.parseNodePath(actionIds[0]);
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
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          onChange(deleteSelectedActions(path, data, actionIds));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionsDeleted);
        };
        break;
      case NodeEventTypes.AppendSelection:
        handler = e => {
          trackActionListChange(e.target);
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

  // HACK: use global handler before we solve iframe state sync problem
  (window as any).copySelection = () => handleEditorEvent(NodeEventTypes.CopySelection);
  (window as any).cutSelection = () => handleEditorEvent(NodeEventTypes.CutSelection);
  (window as any).moveSelection = () => handleEditorEvent(NodeEventTypes.MoveSelection);
  (window as any).deleteSelection = () => handleEditorEvent(NodeEventTypes.DeleteSelection);

  return {
    handleEditorEvent,
  };
};
