// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { EditorActionTypes } from './types/EditorActionTypes';
import { EditorAction } from './types/EditorAction';

export default function reportActionPosition(x: number, y: number): EditorAction {
  return {
    type: EditorActionTypes.ReportActionPosition,
    payload: { x, y },
  };
}
