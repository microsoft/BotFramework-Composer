// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRef, useState, useEffect } from 'react';
import { Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { querySelectableElements } from '../utils/cursorTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
export var useSelectionEffect = function (state, shellApi) {
  var data = state.data,
    nodeContext = state.nodeContext;
  var focusedEvent = nodeContext.focusedEvent,
    focusedId = nodeContext.focusedId;
  var onSelect = shellApi.onSelect,
    onFocusSteps = shellApi.onFocusSteps;
  var _a = useState([]),
    selectedIds = _a[0],
    setSelectedIds = _a[1];
  var _b = useState(querySelectableElements()),
    selectableElements = _b[0],
    setSelectableElements = _b[1];
  var nodeIndexGenerator = useRef(new NodeIndexGenerator());
  var getSelectableIds = function () {
    return nodeIndexGenerator.current.getItemList().map(function (x) {
      return x.key;
    });
  };
  useEffect(
    function () {
      // Notify container at every selection change.
      onSelect(selectedIds.length ? selectedIds : focusedId ? [focusedId] : []);
    },
    [focusedId, selectedIds]
  );
  useEffect(
    function () {
      if (!focusedId) {
        setSelectedIds([]);
      }
    },
    [focusedId]
  );
  useEffect(function () {
    selection.setItems(nodeIndexGenerator.current.getItemList());
  });
  useEffect(
    function () {
      nodeIndexGenerator.current.reset();
      setSelectedIds([]);
      setSelectableElements(querySelectableElements());
    },
    [data, focusedEvent]
  );
  var selection = new Selection({
    onSelectionChanged: function () {
      var selectedIndices = selection.getSelectedIndices();
      var nodeItems = nodeIndexGenerator.current.getItemList();
      var selectedIds = selectedIndices.map(function (index) {
        return nodeItems[index].key;
      });
      if (selectedIds.length === 1) {
        // TODO: Change to focus all selected nodes after Form Editor support showing multiple nodes.
        onFocusSteps(selectedIds);
      }
      setSelectedIds(selectedIds);
    },
  });
  var getNodeIndex = function (nodeId) {
    return nodeIndexGenerator.current.getNodeIndex(nodeId);
  };
  return {
    selection: selection,
    selectedIds: selectedIds,
    setSelectedIds: setSelectedIds,
    selectableElements: selectableElements,
    getNodeIndex: getNodeIndex,
    getSelectableIds: getSelectableIds,
  };
};
//# sourceMappingURL=useSelectionEffect.js.map
