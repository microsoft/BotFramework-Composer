// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { EditorActionTypes } from './types/EditorActionTypes';
import { EditorAction } from './types/EditorAction';

export function insertAdaptiveElementByType(
  targetArrayPath: string,
  targetArrayIndex: number,
  $type: string
): EditorAction {
  return {
    type: EditorActionTypes.Insert,
    payload: {
      targetArrayPath,
      targetArrayIndex,
      $type,
    },
  };
}
