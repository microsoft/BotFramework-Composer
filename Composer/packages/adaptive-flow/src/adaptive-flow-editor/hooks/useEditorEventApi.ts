// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogUtils, SDKKinds, ShellApi, registerEditorAPI, MicrosoftIDialog } from '@bfc/shared';
import get from 'lodash/get';

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

import { useDialogEditApi } from './useDialogEditApi';

export const useEditorEventApi = (
  state: {
    path: string;
    data: MicrosoftIDialog;
    nodeContext: NodeRendererContextValue;
    selectionContext: SelectionContextData;
  },
  shellApi: ShellApi,
) => {
  const { actionsContainLuIntent, getDialog, saveDialog, createDialog } = shellApi;
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
  const { path, data, nodeContext, selectionContext } = state;
  const { focusedId, focusedTab, focusedEvent, clipboardActions, dialogFactory } = nodeContext;
  const { selectedIds, setSelectedIds, selectableElements } = selectionContext;

  const {
    onOpenDialog,
    onFocusSteps,
    onFocusEvent,
    onCopy: onClipboardChange,
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
      const json = get(data, path) as MicrosoftIDialog;
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
          if (e.id === focusedId && e.tab === focusedTab && selectedIds.length === 0) return;
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
        handler = ({ callee }) => {
          onOpenDialog(callee);
          announce(ScreenReaderMessage.DialogOpened);
        };
        break;
      case NodeEventTypes.Delete:
        trackActionChange(eventData.id);
        handler = (e) => {
          deleteSelectedAction(path, data, e.id).then((value) =>
            onChange(value, undefined, async () => {
              await onFocusSteps([]);
              announce(ScreenReaderMessage.ActionDeleted);
            }),
          );
        };
        break;
      case NodeEventTypes.Insert:
        trackActionChange(eventData.id);
        if (eventData.$kind === MenuEventTypes.Paste) {
          handler = (e) => {
            insertActions(path, data, e.id, e.position, clipboardActions).then((dialog) => {
              return onChange(dialog, undefined, async () => {
                await onFocusSteps([`${e.id}[${e.position || 0}]`]);
                announce(ScreenReaderMessage.ActionCreated);
              });
            });
          };
        } else {
          handler = (e) => {
            const newAction = dialogFactory.create(e.$kind);
            insertAction(path, data, e.id, e.position, newAction).then((dialog) => {
              return onChange(dialog, undefined, async () => {
                await onFocusSteps([`${e.id}[${e.position || 0}]`]);
                announce(ScreenReaderMessage.ActionCreated);
              });
            });
          };
        }
        break;
      case NodeEventTypes.CopySelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          copySelectedActions(path, data, actionIds).then((copiedNodes) => onClipboardChange(copiedNodes));
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          cutSelectedActions(path, data, actionIds).then(({ dialog, cutActions }) => {
            onChange(dialog, undefined, async () => {
              await onFocusSteps([]);
              onClipboardChange(cutActions);
            });
          });
          announce(ScreenReaderMessage.ActionsCut);
        };
        break;
      case NodeEventTypes.PasteSelection:
        handler = () => {
          if (!clipboardActions?.length) return;

          const length = selectedIds.length;
          let arrayPath = '';
          let arrayIndex = -1;

          //if there is no selected action, paste it to the end of the current dialog
          if (!length && state.nodeContext?.focusedEvent) {
            const focused = state.nodeContext.focusedEvent;
            const actions = get(data, `${focused}.actions`);
            arrayPath = `${focused}.actions`;
            arrayIndex = actions ? actions.length : 0;
          }

          //If some actions are selected, paste it to the end of the last selected action
          if (length) {
            const result = DialogUtils.parseNodePath(selectedIds[length - 1]);
            if (!result) return;
            arrayPath = result.arrayPath;
            arrayIndex = result.arrayIndex + 1;
          }

          if (!arrayPath) return;

          handleEditorEvent(NodeEventTypes.Insert, {
            id: arrayPath,
            position: arrayIndex,
            $kind: MenuEventTypes.Paste,
          });
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = async () => {
          const actionIds = getClipboardTargetsFromContext();
          if (!Array.isArray(actionIds) || !actionIds.length) return;

          // Create target dialog
          const newDialogId = await createDialog();
          if (!newDialogId) return;
          let newDialogData = getDialog(newDialogId);

          // Using copy->paste->delete pattern is safer than using cut->paste
          const actionsToBeMoved = await copySelectedActions(path, data, actionIds);
          newDialogData = await insertActions(
            newDialogId,
            newDialogData,
            `${'triggers'}[0].${'actions'}`,
            0,
            actionsToBeMoved,
          );
          if (actionsContainLuIntent(actionsToBeMoved)) {
            // auto assign recognizer type to lu
            newDialogData = updateRecognizer(path, newDialogData, `${newDialogId}.lu`);
          }
          saveDialog(newDialogId, newDialogData);

          // Delete moved actions
          const deleteResult = await deleteSelectedActions(path, data, actionIds);

          // Insert a BeginDialog as placeholder
          const placeholderPosition = DialogUtils.parseNodePath(actionIds[0]);
          if (!placeholderPosition) return;

          const placeholderAction = dialogFactory.create(SDKKinds.BeginDialog, { dialog: newDialogId });
          const insertResult = await insertAction(
            path,
            deleteResult,
            placeholderPosition.arrayPath,
            placeholderPosition.arrayIndex,
            placeholderAction,
          );
          onChange(insertResult, undefined, async () => {
            await onFocusSteps([]);
            announce(ScreenReaderMessage.ActionsMoved);
          });
        };
        break;
      case NodeEventTypes.DeleteSelection:
        handler = () => {
          const actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          deleteSelectedActions(path, data, actionIds).then((value) =>
            onChange(value, undefined, async () => {
              await onFocusSteps([]);
              announce(ScreenReaderMessage.ActionsDeleted);
            }),
          );
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
