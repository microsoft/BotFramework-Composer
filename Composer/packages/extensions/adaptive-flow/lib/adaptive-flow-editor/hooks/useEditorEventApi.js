// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __awaiter, __generator, __spreadArrays } from 'tslib';
import { DialogUtils, SDKKinds, registerEditorAPI } from '@bfc/shared';
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
import { calculateRangeSelection } from '../utils/calculateRangeSelection';
export var useEditorEventApi = function (state, shellApi) {
  var _a = useDialogEditApi(shellApi),
    insertAction = _a.insertAction,
    insertActions = _a.insertActions,
    insertActionsAfter = _a.insertActionsAfter,
    copySelectedActions = _a.copySelectedActions,
    cutSelectedActions = _a.cutSelectedActions,
    deleteSelectedAction = _a.deleteSelectedAction,
    deleteSelectedActions = _a.deleteSelectedActions,
    disableSelectedActions = _a.disableSelectedActions,
    enableSelectedActions = _a.enableSelectedActions,
    updateRecognizer = _a.updateRecognizer;
  var _b = useDialogApi(shellApi),
    createDialog = _b.createDialog,
    readDialog = _b.readDialog,
    updateDialog = _b.updateDialog;
  var actionsContainLuIntent = useActionApi(shellApi).actionsContainLuIntent;
  var path = state.path,
    data = state.data,
    nodeContext = state.nodeContext,
    selectionContext = state.selectionContext;
  var focusedId = nodeContext.focusedId,
    focusedEvent = nodeContext.focusedEvent,
    clipboardActions = nodeContext.clipboardActions,
    dialogFactory = nodeContext.dialogFactory;
  var selectedIds = selectionContext.selectedIds,
    setSelectedIds = selectionContext.setSelectedIds,
    selectableElements = selectionContext.selectableElements;
  var onFocusSteps = shellApi.onFocusSteps,
    onFocusEvent = shellApi.onFocusEvent,
    onClipboardChange = shellApi.onCopy,
    onOpen = shellApi.navTo,
    onChange = shellApi.saveData,
    undo = shellApi.undo,
    redo = shellApi.redo,
    announce = shellApi.announce;
  var getClipboardTargetsFromContext = function () {
    var selectedActionIds = normalizeSelection(selectedIds);
    if (selectedActionIds.length === 0 && focusedId) {
      selectedActionIds.push(focusedId);
    }
    return selectedActionIds;
  };
  var trackActionChange = function (actionPath) {
    var affectedPaths = DialogUtils.getParentPaths(actionPath);
    for (var _i = 0, affectedPaths_1 = affectedPaths; _i < affectedPaths_1.length; _i++) {
      var path_1 = affectedPaths_1[_i];
      var json = get(data, path_1);
      designerCache.uncacheBoundary(json);
    }
  };
  var trackActionListChange = function (actionPaths) {
    if (!Array.isArray(actionPaths)) return;
    actionPaths.forEach(function (x) {
      return trackActionChange(x);
    });
  };
  var handleEditorEvent = function (eventName, eventData) {
    if (eventData === void 0) {
      eventData = {};
    }
    var handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = function (e) {
          var newFocusedIds = e.id ? [e.id] : [];
          setSelectedIds(__spreadArrays(newFocusedIds));
          onFocusSteps(__spreadArrays(newFocusedIds), e.tab);
          announce(ScreenReaderMessage.ActionFocused);
        };
        break;
      case NodeEventTypes.CtrlClick:
        handler = function (e) {
          if (!focusedId && !selectedIds.length) {
            return handleEditorEvent(NodeEventTypes.Focus, e);
          }
          // Toggle the selection state of clicked id
          var alreadySelected = selectedIds.some(function (x) {
            return x === e.id;
          });
          if (alreadySelected) {
            var shrinkedSelection = selectedIds.filter(function (x) {
              return x !== e.id;
            });
            setSelectedIds(shrinkedSelection);
            if (focusedId === e.id) {
              onFocusSteps([shrinkedSelection[0] || '']);
            }
            announce(ScreenReaderMessage.ActionUnfocused);
          } else {
            var expandedSelection = __spreadArrays(selectedIds, [e.id]);
            setSelectedIds(expandedSelection);
            onFocusSteps([e.id], e.tab);
            announce(ScreenReaderMessage.ActionFocused);
          }
        };
        break;
      case NodeEventTypes.ShiftClick:
        handler = function (e) {
          if (!focusedId && !selectedIds.length) {
            return handleEditorEvent(NodeEventTypes.Focus, e);
          }
          if (!focusedId) {
            return handleEditorEvent(NodeEventTypes.CtrlClick, e);
          }
          // Maintained by NodeIndexGenerator, `selectableIds` is in pre-order natively.
          var selectableIds = selectionContext.getSelectableIds();
          // Range selection from 'focusedId' to Shift-Clicked id.
          var newSelectedIds = calculateRangeSelection(focusedId, e.id, selectableIds);
          setSelectedIds(newSelectedIds);
          announce(ScreenReaderMessage.RangeSelection);
        };
        break;
      case NodeEventTypes.FocusEvent:
        handler = function (eventData) {
          onFocusEvent(eventData);
          announce(ScreenReaderMessage.EventFocused);
        };
        break;
      case NodeEventTypes.MoveCursor:
        handler = function (eventData) {
          var command = eventData.command;
          var currentSelectedId = selectedIds[0] || focusedId || '';
          var cursor = currentSelectedId
            ? moveCursor(selectableElements, currentSelectedId, command)
            : {
                selected: focusedEvent + '.actions[0]' + MenuTypes.EdgeMenu,
                focused: undefined,
                tab: '',
              };
          var focused = cursor.focused,
            selected = cursor.selected,
            tab = cursor.tab;
          setSelectedIds([selected]);
          focused && onFocusSteps([focused], tab);
          scrollNodeIntoView('[' + AttrNames.SelectedId + '="' + selected + '"]');
          announce(ScreenReaderMessage.ActionFocused);
        };
        break;
      case NodeEventTypes.OpenDialog:
        handler = function (_a) {
          var callee = _a.callee;
          onOpen(callee);
          announce(ScreenReaderMessage.DialogOpened);
        };
        break;
      case NodeEventTypes.Delete:
        trackActionChange(eventData.id);
        handler = function (e) {
          onChange(deleteSelectedAction(path, data, e.id));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionDeleted);
        };
        break;
      case NodeEventTypes.Insert:
        trackActionChange(eventData.id);
        if (eventData.$kind === MenuEventTypes.Paste) {
          handler = function (e) {
            insertActions(path, data, e.id, e.position, clipboardActions).then(function (dialog) {
              onChange(dialog);
              onFocusSteps([e.id + '[' + (e.position || 0) + ']']);
            });
            announce(ScreenReaderMessage.ActionCreated);
          };
        } else {
          handler = function (e) {
            var newAction = dialogFactory.create(e.$kind);
            insertAction(path, data, e.id, e.position, newAction).then(function (dialog) {
              onChange(dialog);
              onFocusSteps([e.id + '[' + (e.position || 0) + ']']);
              announce(ScreenReaderMessage.ActionCreated);
            });
          };
        }
        break;
      case NodeEventTypes.CopySelection:
        handler = function () {
          var actionIds = getClipboardTargetsFromContext();
          copySelectedActions(path, data, actionIds).then(function (copiedNodes) {
            return onClipboardChange(copiedNodes);
          });
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        handler = function () {
          var actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          cutSelectedActions(path, data, actionIds).then(function (_a) {
            var dialog = _a.dialog,
              cutActions = _a.cutActions;
            onChange(dialog);
            onFocusSteps([]);
            onClipboardChange(cutActions);
          });
          announce(ScreenReaderMessage.ActionsCut);
        };
        break;
      case NodeEventTypes.PasteSelection:
        handler = function () {
          var currentSelectedId = selectedIds[0];
          if (currentSelectedId.endsWith('+')) {
            var _a = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {},
              arrayPath = _a.arrayPath,
              arrayIndex = _a.arrayIndex;
            handleEditorEvent(NodeEventTypes.Insert, {
              id: arrayPath,
              position: arrayIndex,
              $kind: MenuEventTypes.Paste,
            });
          }
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var actionIds,
              newDialogId,
              newDialogData,
              actionsToBeMoved,
              deleteResult,
              placeholderPosition,
              placeholderAction,
              insertResult;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  actionIds = getClipboardTargetsFromContext();
                  if (!Array.isArray(actionIds) || !actionIds.length) return [2 /*return*/];
                  return [4 /*yield*/, createDialog()];
                case 1:
                  newDialogId = _a.sent();
                  if (!newDialogId) return [2 /*return*/];
                  newDialogData = readDialog(newDialogId);
                  return [4 /*yield*/, copySelectedActions(path, data, actionIds)];
                case 2:
                  actionsToBeMoved = _a.sent();
                  return [
                    4 /*yield*/,
                    insertActions(newDialogId, newDialogData, 'triggers' + '[0].' + 'actions', 0, actionsToBeMoved),
                  ];
                case 3:
                  newDialogData = _a.sent();
                  if (actionsContainLuIntent(actionsToBeMoved)) {
                    // auto assign recognizer type to lu
                    newDialogData = updateRecognizer(path, newDialogData, newDialogId + '.lu');
                  }
                  updateDialog(newDialogId, newDialogData);
                  deleteResult = deleteSelectedActions(path, data, actionIds);
                  placeholderPosition = DialogUtils.parseNodePath(actionIds[0]);
                  if (!placeholderPosition) return [2 /*return*/];
                  placeholderAction = dialogFactory.create(SDKKinds.BeginDialog, { dialog: newDialogId });
                  return [
                    4 /*yield*/,
                    insertAction(
                      path,
                      deleteResult,
                      placeholderPosition.arrayPath,
                      placeholderPosition.arrayIndex,
                      placeholderAction
                    ),
                  ];
                case 4:
                  insertResult = _a.sent();
                  onChange(insertResult);
                  onFocusSteps([]);
                  announce(ScreenReaderMessage.ActionsMoved);
                  return [2 /*return*/];
              }
            });
          });
        };
        break;
      case NodeEventTypes.DeleteSelection:
        handler = function () {
          var actionIds = getClipboardTargetsFromContext();
          trackActionListChange(actionIds);
          onChange(deleteSelectedActions(path, data, actionIds));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionsDeleted);
        };
        break;
      case NodeEventTypes.DisableSelection:
        handler = function () {
          var actionIds = getClipboardTargetsFromContext();
          onChange(disableSelectedActions(path, data, actionIds));
          announce(ScreenReaderMessage.ActionsDisabled);
        };
        break;
      case NodeEventTypes.EnableSelection:
        handler = function () {
          var actionIds = getClipboardTargetsFromContext();
          onChange(enableSelectedActions(path, data, actionIds));
          announce(ScreenReaderMessage.ActionsEnabled);
        };
        break;
      case NodeEventTypes.AppendSelection:
        handler = function (e) {
          trackActionListChange(e.target);
          // forbid paste to root level.
          if (!e.target || e.target === focusedEvent) return;
          onChange(insertActionsAfter(path, data, e.target, e.actions));
          announce(ScreenReaderMessage.ActionsCreated);
        };
        break;
      case NodeEventTypes.Undo:
        handler = function () {
          undo === null || undo === void 0 ? void 0 : undo();
          announce(ScreenReaderMessage.ActionUndo);
        };
        break;
      case NodeEventTypes.Redo:
        handler = function () {
          redo === null || redo === void 0 ? void 0 : redo();
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
    CopySelection: function () {
      return handleEditorEvent(NodeEventTypes.CopySelection);
    },
    CutSelection: function () {
      return handleEditorEvent(NodeEventTypes.CutSelection);
    },
    MoveSelection: function () {
      return handleEditorEvent(NodeEventTypes.MoveSelection);
    },
    DeleteSelection: function () {
      return handleEditorEvent(NodeEventTypes.DeleteSelection);
    },
    DisableSelection: function () {
      return handleEditorEvent(NodeEventTypes.DisableSelection);
    },
    EnableSelection: function () {
      return handleEditorEvent(NodeEventTypes.EnableSelection);
    },
  });
  return {
    handleEditorEvent: handleEditorEvent,
  };
};
//# sourceMappingURL=useEditorEventApi.js.map
