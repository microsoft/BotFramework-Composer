// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

class UndoHistory {
  public undo() {}

  public redo() {}

  public add() {}

  public clear() {}

  canUndo = () => false;
  canRedo = () => false;
}

const undoHistory = new UndoHistory();
export default undoHistory;
