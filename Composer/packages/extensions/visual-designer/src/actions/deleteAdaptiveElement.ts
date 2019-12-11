// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { EditorActionTypes } from './types/EditorActionTypes';
import { EditorAction } from './types/EditorAction';

export default function deleteAdaptiveElement(dataPath: string): EditorAction {
  return {
    type: EditorActionTypes.Delete,
    payload: dataPath,
  };
}
