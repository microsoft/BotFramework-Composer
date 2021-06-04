// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISelection, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';

export const useSelection = <T>(selectionMode?: SelectionMode) => {
  const [items, setItems] = React.useState<T[]>([]);

  const selection = React.useRef<ISelection>();

  if (!selection.current) {
    selection.current = new Selection({
      onSelectionChanged: () => setItems(selection.current?.getSelection() as T[]),
      selectionMode: selectionMode || SelectionMode.multiple,
    });
  }

  return { selection: selection.current, selectedItems: items };
};
