// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { SelectorElement } from '../utils/cursorTracker';

export interface SelectionContextData {
  getNodeIndex: (id: string) => number;
  getSelectableIds: () => string[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => any;
  selectableElements: SelectorElement[];
}

export const SelectionContext = React.createContext<SelectionContextData>({
  getNodeIndex: (_: string): number => 0,
  getSelectableIds: () => [],
  selectedIds: [] as string[],
  setSelectedIds: () => null,
  selectableElements: [],
});
