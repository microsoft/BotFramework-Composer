// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const SET_FOCUSSTATE = 'VISUAL/SET_FOCUSSTATE';

export default function setFocusState(focusedId: string, focusedTab?: string) {
  return {
    type: SET_FOCUSSTATE,
    payload: {
      focusedId,
      focusedTab,
    },
  };
}
