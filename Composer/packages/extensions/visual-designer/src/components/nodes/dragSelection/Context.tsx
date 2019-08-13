import React from 'react';

interface ContextProps {
  selectedItems: Element[];
}

export const SelectableGroupContext = React.createContext<Partial<ContextProps>>({ selectedItems: [] });
