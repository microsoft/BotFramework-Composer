import React from 'react';

export const SelectionContext = React.createContext({
  getNodeIndex: (id: string): number => 0,
});
