// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useState, useEffect, useContext } from 'react';
import { Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { useShellApi } from '@bfc/extension';

import { querySelectableElements, SelectorElement } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { NodeRendererContext } from '../store/NodeRendererContext';

export const useSelectionEffect = () => {
  const { shellApi, data } = useShellApi();
  const { focusedEvent, focusedId } = useContext(NodeRendererContext);
  const { onSelect, onFocusSteps } = shellApi;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectableElements, setSelectableElements] = useState<SelectorElement[]>(querySelectableElements());
  const nodeIndexGenerator = useRef(new NodeIndexGenerator());

  useEffect((): void => {
    // Notify container at every selection change.
    onSelect(selectedIds.length ? selectedIds : focusedId ? [focusedId] : []);
  }, [focusedId, selectedIds]);

  useEffect((): void => {
    if (!focusedId) {
      setSelectedIds([]);
    }
  }, [focusedId]);

  useEffect((): void => {
    selection.setItems(nodeIndexGenerator.current.getItemList());
  });

  useEffect((): void => {
    nodeIndexGenerator.current.reset();
    setSelectedIds([]);
    setSelectableElements(querySelectableElements());
  }, [data, focusedEvent]);

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const nodeItems = nodeIndexGenerator.current.getItemList();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);

      if (selectedIds.length === 1) {
        // TODO: Change to focus all selected nodes after Form Editor support showing multiple nodes.
        onFocusSteps(selectedIds);
      }
      setSelectedIds(selectedIds);
    },
  });

  const getNodeIndex = (nodeId: string): number => nodeIndexGenerator.current.getNodeIndex(nodeId);
  return {
    selection,
    selectedIds,
    setSelectedIds,
    selectableElements,
    getNodeIndex,
  };
};
