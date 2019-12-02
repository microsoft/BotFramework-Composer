// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const UNDO = 'VISUAL/UNDO';
export function undo() {
  return {
    type: UNDO,
  };
}

export const REDO = 'VISUAL/REDO';
export function redo() {
  return {
    type: REDO,
  };
}
