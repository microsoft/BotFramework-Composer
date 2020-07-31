// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Snapshot } from 'recoil';

export class UndoHistory {
  public stack: Snapshot[] = [];
  public present = -1;

  public undo() {
    if (!this.canUndo()) throw new Error('Undo is not support');

    --this.present;
    return this.stack[this.present];
  }

  public redo() {
    if (!this.canRedo()) throw new Error('Redo is not support');

    ++this.present + 1;
    return this.stack[this.present];
  }

  public add(snap: Snapshot) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present, this.stack.length - this.present - 1);
    }
    this.stack.push(snap);
    this.present++;
  }

  public replace(snap: Snapshot) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present, this.stack.length - this.present - 1);
    }
    this.stack[this.present] = snap;
  }

  public clear() {
    this.present = -1;
    this.stack = [];
  }

  canUndo = () => this.stack.length > 0 && this.present > 0;
  canRedo = () => this.stack.length > 0 && this.present < this.stack.length - 1;
}

const undoHistory = new UndoHistory();
export default undoHistory;
