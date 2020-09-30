// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useState, useEffect } from 'react';
import { Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { ShellApi } from '@bfc/shared';
import isEqual from 'lodash/isEqual';

import { querySelectableElements, SelectorElement } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { NodeRendererContextValue } from '../contexts/NodeRendererContext';

export const useSelectionEffect = (state: { data: any; nodeContext: NodeRendererContextValue }, shellApi: ShellApi) => {
  const { data, nodeContext } = state;
  const { focusedEvent, focusedId } = nodeContext;
  const { onSelect, onFocusSteps } = shellApi;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectableElements, setSelectableElements] = useState<SelectorElement[]>(querySelectableElements());
  const nodeIndexGenerator = useRef(new NodeIndexGenerator());
  const selectedIdsRef = useRef(focusedId ? [focusedId] : []);

  const getSelectableIds = () => nodeIndexGenerator.current.getItemList().map((x) => x.key as string);

  useEffect((): void => {
    const currentSelectedIds = selectedIds.length ? selectedIds : focusedId ? [focusedId] : [];
    if (!isEqual(currentSelectedIds, selectedIdsRef.current)) {
      selectedIdsRef.current = currentSelectedIds;
      // Notify container at every selection change.
      onSelect(currentSelectedIds);
    }
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
    //this one will clean the ids
    setSelectedIds([]);
    setSelectableElements(querySelectableElements());
  }, [data, focusedEvent]);

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const nodeItems = nodeIndexGenerator.current.getItemList();
      const selectedIds = selectedIndices.map((index) => nodeItems[index].key as string);

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
    getSelectableIds,
  };
};
