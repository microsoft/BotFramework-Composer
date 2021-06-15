// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISelection, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React from 'react';

/**
 * A hook that can be used in conjunction with the table component. This provides
 * a way of subscribing to the selected rows in the table. It returns an object
 * containing the selection instance and an array containing the currently
 * selected items.
 *
 * @param initialSelectionMode An optional selection mode to use with the hook.
 */
export function useSelection<T>(initialSelectionMode?: SelectionMode) {
  const [items, setItems] = React.useState<T[]>([]);

  const selection = React.useRef<ISelection>();

  if (!selection.current) {
    selection.current = new Selection({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      onSelectionChanged: () => setItems(<T[]>selection.current.getSelection()),
      selectionMode: initialSelectionMode || SelectionMode.multiple,
    });
  }

  return { selection: selection.current, selectedItems: items };
}
