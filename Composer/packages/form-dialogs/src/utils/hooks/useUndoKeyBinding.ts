// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useKeyBinding } from 'src/utils/hooks/useKeyBinding';

export const useUndoKeyBinding = () => {
  useKeyBinding('keyup', (e) => {
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'z': {
          if (e.shiftKey) {
            //TODO
          } else {
            //TODO
          }
        }
      }
    }
  });
};
