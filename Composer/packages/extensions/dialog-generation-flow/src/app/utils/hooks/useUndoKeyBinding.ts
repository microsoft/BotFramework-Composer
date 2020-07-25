// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Context } from 'src/app/context/Context';
import { useKeyBinding } from 'src/app/utils/hooks/useKeyBinding';

export const useUndoKeyBinding = () => {
  const { dispatcher } = React.useContext(Context);
  useKeyBinding('keyup', (e) => {
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'z': {
          if (e.shiftKey) {
            dispatcher.dispatch('redo');
          } else {
            dispatcher.dispatch('undo');
          }
        }
      }
    }
  });
};
