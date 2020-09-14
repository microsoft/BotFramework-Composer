// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
export var defaultSelectionContextValue = {
  getNodeIndex: function (_) {
    return 0;
  },
  getSelectableIds: function () {
    return [];
  },
  selectedIds: [],
  setSelectedIds: function () {
    return null;
  },
  selectableElements: [],
};
export var SelectionContext = React.createContext(defaultSelectionContextValue);
//# sourceMappingURL=SelectionContext.js.map
