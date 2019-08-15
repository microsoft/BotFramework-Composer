import React from 'react';

interface ContextProps {
  selectedItems: any[];
}

export const SelectableGroupContext = React.createContext<Partial<ContextProps>>({ selectedItems: [] });
