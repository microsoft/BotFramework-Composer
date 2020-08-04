// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Snapshot } from 'recoil';

export class UndoHistory {
  public stack: Snapshot[] = [];
  public present = -1;
  public initialLocation = { dialogId: '', selected: '', focused: '' };

  public undo() {
    if (!this.canUndo()) throw new Error('Undo is not support');

    this.present = this.present - 1;
    return this.stack[this.present];
  }

  public redo() {
    if (!this.canRedo()) throw new Error('Redo is not support');

    this.present = this.present + 1;
    return this.stack[this.present];
  }

  public add(snap: Snapshot) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present + 1, this.stack.length - this.present - 1);
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

  public setInitialLocation(v: { dialogId: string; selected: string; focused: string }) {
    if (this.stack.length === 1) {
      this.initialLocation = v;
    }
  }

  public canUndo = () => this.stack.length > 0 && this.present > 0;
  public canRedo = () => this.stack.length > 0 && this.present < this.stack.length - 1;
  public isEmpty = () => this.stack.length === 0;
  public getPresentSnapshot = () => (this.present > -1 ? this.stack[this.present] : null);
}

const undoHistory = new UndoHistory();
export default undoHistory;
