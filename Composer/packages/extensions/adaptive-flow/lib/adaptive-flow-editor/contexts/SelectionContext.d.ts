import React from 'react';
import { SelectorElement } from '../utils/cursorTracker';
export interface SelectionContextData {
  getNodeIndex: (id: string) => number;
  getSelectableIds: () => string[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => any;
  selectableElements: SelectorElement[];
}
export declare const defaultSelectionContextValue: {
  getNodeIndex: (_: string) => number;
  getSelectableIds: () => never[];
  selectedIds: string[];
  setSelectedIds: () => null;
  selectableElements: never[];
};
export declare const SelectionContext: React.Context<SelectionContextData>;
//# sourceMappingURL=SelectionContext.d.ts.map
