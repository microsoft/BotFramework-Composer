// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const CLEAR_SELECTIONSTATE = 'VISUAL/SET_SELECTIONSTATE';

export default function clearSelectionState() {
  return {
    type: CLEAR_SELECTIONSTATE,
  };
}
