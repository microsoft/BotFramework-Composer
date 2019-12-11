// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { EditorActionTypes } from './types/EditorActionTypes';
import { EditorAction } from './types/EditorAction';

export default function navigateToDialog(targetDialogName: string): EditorAction {
  return {
    type: EditorActionTypes.Navigation,
    payload: targetDialogName,
  };
}
