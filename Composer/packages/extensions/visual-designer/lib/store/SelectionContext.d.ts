import React from 'react';
export interface SelectionContextData {
  getNodeIndex: (id: string) => number;
  selectedIds: string[];
}
export declare const SelectionContext: React.Context<SelectionContextData>;
//# sourceMappingURL=SelectionContext.d.ts.map
