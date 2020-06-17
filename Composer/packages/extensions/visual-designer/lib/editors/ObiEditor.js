// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useEffect, useState, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { SDKKinds, DialogUtils } from '@bfc/shared';
import { useDialogApi, useDialogEditApi, useActionApi, useShellApi } from '@bfc/extension';
import get from 'lodash/get';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { ScreenReaderMessage } from '../constants/ScreenReaderMessage';
import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectionContext } from '../store/SelectionContext';
import { moveCursor, querySelectableElements } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { normalizeSelection } from '../utils/normalizeSelection';
import { KeyboardZone } from '../components/lib/KeyboardZone';
import { scrollNodeIntoView } from '../utils/nodeOperation';
import { designerCache } from '../store/DesignerCache';
import { MenuTypes, MenuEventTypes } from '../constants/MenuTypes';
import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
export var ObiEditor = function (_a) {
  var path = _a.path,
    data = _a.data,
    onFocusEvent = _a.onFocusEvent,
    onFocusSteps = _a.onFocusSteps,
    onClipboardChange = _a.onClipboardChange,
    onOpen = _a.onOpen,
    onChange = _a.onChange,
    onSelect = _a.onSelect,
    undo = _a.undo,
    redo = _a.redo,
    announce = _a.announce;
  var _b = useContext(NodeRendererContext),
    focusedId = _b.focusedId,
    focusedEvent = _b.focusedEvent,
    clipboardActions = _b.clipboardActions,
    dialogFactory = _b.dialogFactory;
  var shellApi = useShellApi().shellApi;
  var _c = useDialogEditApi(shellApi),
    insertAction = _c.insertAction,
    insertActions = _c.insertActions,
    insertActionsAfter = _c.insertActionsAfter,
    copySelectedActions = _c.copySelectedActions,
    cutSelectedActions = _c.cutSelectedActions,
    deleteSelectedAction = _c.deleteSelectedAction,
    deleteSelectedActions = _c.deleteSelectedActions,
    updateRecognizer = _c.updateRecognizer;
  var _d = useDialogApi(shellApi),
    createDialog = _d.createDialog,
    readDialog = _d.readDialog,
    updateDialog = _d.updateDialog;
  var actionsContainLuIntent = useActionApi(shellApi).actionsContainLuIntent;
  var divRef = useRef(null);
  // send focus to the keyboard area when navigating to a new trigger
  useEffect(
    function () {
      var _a;
      (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    },
    [focusedEvent]
  );
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
  var dispatchEvent = function (eventName, eventData) {
    var handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = function (e) {
          var newFocusedIds = e.id ? [e.id] : [];
          setSelectionContext(__assign(__assign({}, selectionContext), { selectedIds: __spreadArrays(newFocusedIds) }));
          onFocusSteps(__spreadArrays(newFocusedIds), e.tab);
          announce(ScreenReaderMessage.ActionFocused);
        };
        break;
      case NodeEventTypes.FocusEvent:
        handler = function (eventData) {
          onFocusEvent(eventData);
          announce(ScreenReaderMessage.EventFocused);
        };
        break;
      case NodeEventTypes.OpenDialog:
        handler = function (_a) {
          var caller = _a.caller,
            callee = _a.callee;
          onOpen(callee, caller);
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
        handler = function (e) {
          copySelectedActions(path, data, e.actionIds).then(function (copiedNodes) {
            return onClipboardChange(copiedNodes);
          });
          announce(ScreenReaderMessage.ActionsCopied);
        };
        break;
      case NodeEventTypes.CutSelection:
        trackActionListChange(eventData.actionIds);
        handler = function (e) {
          cutSelectedActions(path, data, e.actionIds).then(function (_a) {
            var dialog = _a.dialog,
              cutActions = _a.cutActions;
            onChange(dialog);
            onFocusSteps([]);
            onClipboardChange(cutActions);
          });
          announce(ScreenReaderMessage.ActionsCut);
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = function (e) {
          return __awaiter(void 0, void 0, void 0, function () {
            var newDialogId,
              newDialogData,
              actionsToBeMoved,
              deleteResult,
              placeholderPosition,
              placeholderAction,
              insertResult;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  if (!Array.isArray(e.actionIds) || !e.actionIds.length) return [2 /*return*/];
                  return [4 /*yield*/, createDialog()];
                case 1:
                  newDialogId = _a.sent();
                  if (!newDialogId) return [2 /*return*/];
                  newDialogData = readDialog(newDialogId);
                  return [4 /*yield*/, copySelectedActions(path, data, e.actionIds)];
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
                  deleteResult = deleteSelectedActions(path, data, e.actionIds);
                  placeholderPosition = DialogUtils.parseNodePath(e.actionIds[0]);
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
        trackActionListChange(eventData.actionIds);
        handler = function (e) {
          onChange(deleteSelectedActions(path, data, e.actionIds));
          onFocusSteps([]);
          announce(ScreenReaderMessage.ActionsDeleted);
        };
        break;
      case NodeEventTypes.AppendSelection:
        trackActionListChange(eventData.target);
        handler = function (e) {
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
  var renderFallbackContent = function () {
    return null;
  };
  var resetSelectionData = function () {
    nodeIndexGenerator.current.reset();
    setSelectionContext({
      getNodeIndex: selectionContext.getNodeIndex,
      selectedIds: [],
    });
  };
  var nodeIndexGenerator = useRef(new NodeIndexGenerator());
  var nodeItems = nodeIndexGenerator.current.getItemList();
  var _e = useState({
      getNodeIndex: function (nodeId) {
        return nodeIndexGenerator.current.getNodeIndex(nodeId);
      },
      selectedIds: [],
    }),
    selectionContext = _e[0],
    setSelectionContext = _e[1];
  useEffect(
    function () {
      // Notify container at every selection change.
      onSelect(selectionContext.selectedIds.length ? selectionContext.selectedIds : focusedId ? [focusedId] : []);
    },
    [focusedId, selectionContext]
  );
  useEffect(function () {
    selection.setItems(nodeIndexGenerator.current.getItemList());
  });
  useEffect(
    function () {
      resetSelectionData();
      setSelectableElements(querySelectableElements());
    },
    [data, focusedEvent]
  );
  useEffect(
    function () {
      if (!focusedId) {
        resetSelectionData();
      }
    },
    [focusedId]
  );
  var selection = new Selection({
    onSelectionChanged: function () {
      var selectedIndices = selection.getSelectedIndices();
      var selectedIds = selectedIndices.map(function (index) {
        return nodeItems[index].key;
      });
      if (selectedIds.length === 1) {
        // TODO: Change to focus all selected nodes after Form Editor support showing multiple nodes.
        onFocusSteps(selectedIds);
      }
      setSelectionContext(__assign(__assign({}, selectionContext), { selectedIds: selectedIds }));
    },
  });
  var _f = useState(querySelectableElements()),
    selectableElements = _f[0],
    setSelectableElements = _f[1];
  var getClipboardTargetsFromContext = function () {
    var selectedActionIds = normalizeSelection(selectionContext.selectedIds);
    if (selectedActionIds.length === 0 && focusedId) {
      selectedActionIds.push(focusedId);
    }
    return selectedActionIds;
  };
  // HACK: use global handler before we solve iframe state sync problem
  window.hasElementFocused = function () {
    return !!focusedId && focusedId !== focusedEvent;
  };
  window.hasElementSelected = function () {
    return (
      !!(selectionContext && selectionContext.selectedIds && selectionContext.selectedIds.length) ||
      window.hasElementFocused()
    );
  };
  window.copySelection = function () {
    return dispatchEvent(NodeEventTypes.CopySelection, { actionIds: getClipboardTargetsFromContext() });
  };
  window.cutSelection = function () {
    return dispatchEvent(NodeEventTypes.CutSelection, { actionIds: getClipboardTargetsFromContext() });
  };
  window.moveSelection = function () {
    return dispatchEvent(NodeEventTypes.MoveSelection, { actionIds: getClipboardTargetsFromContext() });
  };
  window.deleteSelection = function () {
    return dispatchEvent(NodeEventTypes.DeleteSelection, { actionIds: getClipboardTargetsFromContext() });
  };
  var handleKeyboardCommand = function (_a) {
    var area = _a.area,
      command = _a.command;
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
            var currentSelectedId = selectionContext.selectedIds[0];
            if (currentSelectedId.endsWith('+')) {
              var _b = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {},
                arrayPath = _b.arrayPath,
                arrayIndex = _b.arrayIndex;
              dispatchEvent(NodeEventTypes.Insert, {
                id: arrayPath,
                position: arrayIndex,
                $kind: MenuEventTypes.Paste,
              });
            }
            break;
          }
        }
        break;
      case KeyboardPrimaryTypes.Cursor: {
        var currentSelectedId = selectionContext.selectedIds[0] || focusedId || '';
        var _c = currentSelectedId
            ? moveCursor(selectableElements, currentSelectedId, command)
            : {
                selected: focusedEvent + '.actions[0]' + MenuTypes.EdgeMenu,
                focused: undefined,
                tab: '',
              },
          selected = _c.selected,
          focused = _c.focused,
          tab = _c.tab;
        setSelectionContext({
          getNodeIndex: selectionContext.getNodeIndex,
          selectedIds: [selected],
        });
        focused && onFocusSteps([focused], tab);
        scrollNodeIntoView('[' + AttrNames.SelectedId + '="' + selected + '"]');
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
  return jsx(
    SelectionContext.Provider,
    { value: selectionContext },
    jsx(
      KeyboardZone,
      { ref: divRef, onCommand: handleKeyboardCommand },
      jsx(
        MarqueeSelection,
        { css: { width: '100%', height: '100%' }, selection: selection },
        jsx(
          'div',
          {
            className: 'obi-editor-container',
            css: {
              width: '100%',
              height: '100%',
              padding: '48px 20px',
              boxSizing: 'border-box',
            },
            'data-testid': 'obi-editor-container',
            onClick: function (e) {
              e.stopPropagation();
              dispatchEvent(NodeEventTypes.Focus, { id: '' });
            },
          },
          jsx(AdaptiveDialogEditor, {
            data: data,
            id: path,
            onEvent: function (eventName, eventData) {
              var _a;
              (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
              dispatchEvent(eventName, eventData);
            },
          })
        )
      )
    )
  );
};
ObiEditor.defaultProps = {
  path: '.',
  data: {},
  focusedSteps: [],
  onFocusSteps: function () {},
  onFocusEvent: function () {},
  onClipboardChange: function () {},
  onOpen: function () {},
  onChange: function () {},
  onSelect: function () {},
  undo: function () {},
  redo: function () {},
  announce: function (message) {},
};
//# sourceMappingURL=ObiEditor.js.map
