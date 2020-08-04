// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogUtils, SDKKinds, ShellApi, registerEditorAPI } from '@bfc/shared';
import get from 'lodash/get';
import { useDialogEditApi, useDialogApi, useActionApi } from '@bfc/extension';

// TODO: leak of visual-sdk domain (designerCache)
import { designerCache } from '../../adaptive-flow-renderer/utils/visual/DesignerCache';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { ScreenReaderMessage } from '../constants/ScreenReaderMessage';
import { scrollNodeIntoView } from '../utils/scrollNodeIntoView';
import { MenuEventTypes, MenuTypes } from '../constants/MenuTypes';
import { normalizeSelection } from '../utils/normalizeSelection';
import { moveCursor } from '../utils/cursorTracker';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContextValue } from '../contexts/NodeRendererContext';
import { SelectionContextData } from '../contexts/SelectionContext';
import { calculateRangeSelection } from '../utils/calculateRangeSelection';

export const useEditorEventApi = (
  state: { path: string; data: any; nodeContext: NodeRendererContextValue; selectionContext: SelectionContextData },
  shellApi: ShellApi
) => {
  const {
    insertAction,
    insertActions,
    insertActionsAfter,
    copySelectedActions,
    cutSelectedActions,
    deleteSelectedAction,
    deleteSelectedActions,
    disableSelectedActions,
    enableSelectedActions,
    updateRecognizer,
  } = useDialogEditApi(shellApi);
  const { createDialog, readDialog, updateDialog } = useDialogApi(shellApi);
  const { actionsContainLuIntent } = useActionApi(shellApi);
  const { path, data, nodeContext, selectionContext } = state;
  const { focusedId, focusedEvent, clipboardActions, dialogFactory } = nodeContext;
  const { selectedIds, setSelectedIds, selectableElements } = selectionContext;

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
    actionPaths.forEach((x) => trackActionChange(x));
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
      case NodeEventTypes.CtrlClick:
        handler = (e: { id: string; tab?: string }) => {
          if (!focusedId && !selectedIds.length) {
            return handleEditorEvent(NodeEventTypes.Focus, e);
          }

          // Toggle the selection state of clicked id
          const alreadySelected = selectedIds.some((x) => x === e.id);
          if (alreadySelected) {
            const shrinkedSelection = selectedIds.filter((x) => x !== e.id);
            setSelectedIds(shrinkedSelection);
            if (focusedId === e.id) {
              onFocusSteps([shrinkedSelection[0] || '']);
            }
            announce(ScreenReaderMessage.ActionUnfocused);
          } else {
            const expandedSelection = [...selectedIds, e.id];
            setSelectedIds(expandedSelection);
            onFocusSteps([e.id], e.tab);
            announce(ScreenReaderMessage.ActionFocused);
          }
        };
        break;
      case NodeEventTypes.ShiftClick:
        handler = (e: { id: string; tab?: string }) => {
          if (!focusedId && !selectedIds.length) {
            return handleEditorEvent(NodeEventTypes.Focus, e);
          }

          if (!focusedId) {
            return handleEditorEvent(NodeEventTypes.CtrlClick, e);
          }

          // Maintained by NodeIndexGenerator, `selectableIds` is in pre-order natively.
          const selectableIds = selectionContext.getSelectableIds();
          // Range selection from 'focusedId' to Shift-Clicked id.
          const newSelectedIds = calculateRangeSelection(focusedId, e.id, selectableIds);
          setSelectedIds(newSelectedIds);
          announce(ScreenReaderMessage.RangeSelection);
        };
        break;
      case NodeEventTypes.FocusEvent:
        handler = (eventData) => {
          onFocusEvent(eventData);
          announce(ScreenReaderMessage.EventFocused);
        };
        break;
      case NodeEventTypes.MoveCursor:
        handler = (eventData) => {
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
        handler = (e) => {
          onChange(deleteSelectedAction(path, data, e.id));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionDeleted);
        };
        break;
      case NodeEventTypes.Insert:
        trackActionChange(eventData.id);
        if (eventData.$kind === MenuEventTypes.Paste) {
          handler = (e) => {
            const dialog = insertActions(path, data, e.id, e.position, clipboardActions);
            onChange(dialog);
            onFocusSteps([`${e.id}[${e.position || 0}]`]);

            announce(ScreenReaderMessage.ActionCreated);
          };
        } else {
          handler = (e) => {
            const newAction = dialogFactory.create(e.$kind);
            const dialog = insertAction(path, data, e.id, e.position, newAction);
            onChange(dialog);
            onFocusSteps([`${e.id}[${e.position || 0}]`]);
            announce(ScreenReaderMessage.ActionCreated);
          };
        }
        break;
      case NodeEventTypes.CopySelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          const copiedNodes = copySelectedActions(path, data, actionIds);
          onClipboardChange(copiedNodes);
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          const { dialog, cutActions } = cutSelectedActions(path, data, actionIds);
          onChange(dialog);
          onFocusSteps([]);
          onClipboardChange(cutActions);
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
          const actionsToBeMoved = copySelectedActions(path, data, actionIds);
          newDialogData = insertActions(
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
          const insertResult = insertAction(
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
      case NodeEventTypes.DisableSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          onChange(disableSelectedActions(path, data, actionIds));
          announce(ScreenReaderMessage.ActionsDisabled);
        };
        break;
      case NodeEventTypes.EnableSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          onChange(enableSelectedActions(path, data, actionIds));
          announce(ScreenReaderMessage.ActionsEnabled);
        };
        break;
      case NodeEventTypes.AppendSelection:
        handler = (e) => {
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

  registerEditorAPI('Actions', {
    CopySelection: () => handleEditorEvent(NodeEventTypes.CopySelection),
    CutSelection: () => handleEditorEvent(NodeEventTypes.CutSelection),
    MoveSelection: () => handleEditorEvent(NodeEventTypes.MoveSelection),
    DeleteSelection: () => handleEditorEvent(NodeEventTypes.DeleteSelection),
    DisableSelection: () => handleEditorEvent(NodeEventTypes.DisableSelection),
    EnableSelection: () => handleEditorEvent(NodeEventTypes.EnableSelection),
  });

  return {
    handleEditorEvent,
  };
};
