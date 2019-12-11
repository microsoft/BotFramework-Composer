// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { EditorActionTypes } from './types/EditorActionTypes';

export default function setEventPath(eventPath: string) {
  return {
    type: EditorActionTypes.FocusEvent,
    payload: eventPath,
  };
}
