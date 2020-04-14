// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC, useEffect, useState, useRef } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import {
  SDKKinds,
  deleteAction,
  deleteActions,
  LgTemplateRef,
  LgMetaData,
  ExternalResourceHandlerAsync,
  walkLgResourcesInActionList,
} from '@bfc/shared';
import get from 'lodash/get';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectionContext, SelectionContextData } from '../store/SelectionContext';
import {
  deleteNode,
  insert,
  cutNodes,
  copyNodes,
  appendNodesAfter,
  pasteNodes,
  deleteNodes,
  getParentPaths,
  insertAction,
} from '../utils/jsonTracker';
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
  onCreateDialog,
  onSelect,
  undo,
  redo,
  addCoachMarkRef,
}): JSX.Element | null => {
  let divRef;

  const {
    focusedId,
    focusedEvent,
    clipboardActions,
    getLgTemplates,
    updateLgTemplate,
    removeLgTemplates,
    removeLuIntent,
    dialogFactory,
  } = useContext(NodeRendererContext);

  const dereferenceLg: ExternalResourceHandlerAsync<string> = async (
    actionId: string,
    actionData: any,
    lgFieldName: string,
    lgText?: string
  ): Promise<string> => {
    if (!lgText) return '';

    const inputLgRef = LgTemplateRef.parse(lgText);
    if (!inputLgRef) return lgText;

    const lgTemplates = await getLgTemplates(inputLgRef.name);
    if (!Array.isArray(lgTemplates) || !lgTemplates.length) return lgText;

    const targetTemplate = lgTemplates.find(x => x.name === inputLgRef.name);
    return targetTemplate ? targetTemplate.body : lgText;
  };

  const buildLgReference: ExternalResourceHandlerAsync<string> = async (nodeId, data, fieldName, fieldText) => {
    if (!fieldText) return '';
    const newLgTemplateName = new LgMetaData(fieldName, nodeId).toString();
    const newLgTemplateRefStr = new LgTemplateRef(newLgTemplateName).toString();
    await updateLgTemplate(path, newLgTemplateName, fieldText);
    return newLgTemplateRefStr;
  };

  const deleteLgTemplates = (lgTemplates: string[]) => {
    const normalizedLgTemplates = lgTemplates
      .map(x => {
        const lgTemplateRef = LgTemplateRef.parse(x);
        return lgTemplateRef ? lgTemplateRef.name : '';
      })
      .filter(x => !!x);
    const lgFileId = path;
    return removeLgTemplates(lgFileId, normalizedLgTemplates);
  };

  const trackActionChange = (actionPath: string) => {
    const affectedPaths = getParentPaths(actionPath);
    for (const path of affectedPaths) {
      const json = get(data, path);
      designerCache.uncacheBoundary(json);
    }
  };

  const trackActionListChange = (actionPaths: string[]) => {
    if (!Array.isArray(actionPaths)) return;
    actionPaths.forEach(x => trackActionChange(x));
  };

  const deleteLuIntents = (luIntents: string[]) => {
    return Promise.all(luIntents.map(intent => removeLuIntent(path, intent)));
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
        };
        break;
      case NodeEventTypes.FocusEvent:
        handler = onFocusEvent;
        break;
      case NodeEventTypes.OpenDialog:
        handler = ({ caller, callee }) => onOpen(callee, caller);
        break;
      case NodeEventTypes.Delete:
        trackActionChange(eventData.id);
        handler = e => {
          onChange(deleteNode(data, e.id, node => deleteAction(node, deleteLgTemplates, deleteLuIntents)));
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.Insert:
        trackActionChange(eventData.id);
        if (eventData.$kind === 'PASTE') {
          handler = e => {
            pasteNodes(data, e.id, e.position, clipboardActions, buildLgReference).then(dialog => {
              onChange(dialog);
            });
          };
        } else {
          handler = e => {
            const dialog = insert(data, e.id, e.position, e.$kind, dialogFactory);
            onChange(dialog);
            onFocusSteps([`${e.id}[${e.position || 0}]`]);
          };
        }
        break;
      case NodeEventTypes.InsertEvent:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$kind, dialogFactory);
          onChange(dialog);
          onFocusEvent(`${e.id}[${e.position || 0}]`);
        };
        break;
      case NodeEventTypes.CopySelection:
        handler = e => {
          copyNodes(data, e.actionIds, dereferenceLg).then(copiedNodes => onClipboardChange(copiedNodes));
        };
        break;
      case NodeEventTypes.CutSelection:
        trackActionListChange(eventData.actionIds);
        handler = e => {
          cutNodes(data, e.actionIds, dereferenceLg, nodes =>
            deleteActions(nodes, deleteLgTemplates, deleteLuIntents)
          ).then(({ dialog, cutData }) => {
            onChange(dialog);
            onFocusSteps([]);
            onClipboardChange(cutData);
          });
        };
        break;
      case NodeEventTypes.MoveSelection:
        handler = e => {
          if (!Array.isArray(e.actionIds) || !e.actionIds.length) return;

          // Using copy-paste-delete pattern here is safer than using cut-paste
          // since create new dialog may be cancelled or failed
          copyNodes(data, e.actionIds, dereferenceLg)
            .then(copiedActions => {
              const lgTemplatesToBeCreated: { name: string; body: string }[] = [];
              walkLgResourcesInActionList(copiedActions, (designerId, actionData, fieldName, lgStr) => {
                if (!lgStr) return '';

                const lgName = new LgMetaData(fieldName, designerId).toString();
                const refString = new LgTemplateRef(lgName).toString();

                lgTemplatesToBeCreated.push({ name: lgName, body: lgStr });
                actionData[fieldName] = refString;
                return refString;
              });
              return onCreateDialog(copiedActions).then(dialogName => ({ dialogName, lgTemplatesToBeCreated }));
            })
            .then(async ({ dialogName: newDialog, lgTemplatesToBeCreated }) => {
              // defense modal cancellation
              if (!newDialog) return;

              // create lg templates for actions in new dialog
              for (const { name, body } of lgTemplatesToBeCreated) {
                await updateLgTemplate(newDialog, name, body);
              }

              // delete old actions (they are already moved to new dialog)

              // HACK: https://github.com/microsoft/BotFramework-Composer/issues/2247
              const postponedDeleteLgTemplates = templates => setTimeout(() => deleteLgTemplates(templates), 501);
              const deleteResult = deleteNodes(data, e.actionIds, nodes =>
                deleteActions(nodes, postponedDeleteLgTemplates, deleteLuIntents)
              );

              // insert a BeginDialog action points to newly created dialog
              const indexes = e.actionIds[0].match(/^(.+)\[(\d+)\]$/);
              if (indexes === null || indexes.length !== 3) return;

              const [, arrayPath, actionIndexStr] = indexes;
              const startIndex = parseInt(actionIndexStr);
              const placeholderAction = dialogFactory.create(SDKKinds.BeginDialog, { dialog: newDialog });
              const insertResult = insertAction(deleteResult, arrayPath, startIndex, placeholderAction);
              onChange(insertResult);
            });
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.DeleteSelection:
        trackActionListChange(eventData.actionIds);
        handler = e => {
          const dialog = deleteNodes(data, e.actionIds, nodes =>
            deleteActions(nodes, deleteLgTemplates, deleteLuIntents)
          );
          onChange(dialog);
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.AppendSelection:
        trackActionListChange(eventData.target);
        handler = e => {
          // forbid paste to root level.
          if (!e.target || e.target === focusedEvent) return;
          const dialog = appendNodesAfter(data, e.target, e.actions);
          onChange(dialog);
        };
        break;
      case NodeEventTypes.Undo:
        handler = undo;
        break;
      case NodeEventTypes.Redo:
        handler = redo;
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
          case KeyboardCommandTypes.Node.Paste:
            dispatchEvent(NodeEventTypes.AppendSelection, {
              target: focusedId,
              actions: clipboardActions,
            });
            break;
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
  addCoachMarkRef?: (ref: { [key: string]: HTMLDivElement }) => void;
}
