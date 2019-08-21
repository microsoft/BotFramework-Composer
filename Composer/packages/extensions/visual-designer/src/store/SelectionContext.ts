import React from 'react';

export interface SelectionContextData {
  getNodeIndex: (id: string) => number;
  selectedIds: string[];
}

export const SelectionContext = React.createContext<SelectionContextData>({
  getNodeIndex: (_: string): number => 0,
  selectedIds: [] as string[],
});
