// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { DesignPageLocation } from './../types';
import { AtomAssetsMap } from './trackedAtoms';

// use number to limit the stack size first
const MAX_STACK_LENGTH = 30;

export class UndoHistory {
  public stack: AtomAssetsMap[] = [];
  public present = -1;
  public initialLocation = { dialogId: '', selected: '', focused: '', projectId: '' };

  public undo() {
    if (!this.canUndo()) throw new Error(formatMessage('Undo is not support'));

    this.present = this.present - 1;
    return this.stack[this.present];
  }

  public redo() {
    if (!this.canRedo()) throw new Error(formatMessage('Redo is not support'));

    this.present = this.present + 1;
    return this.stack[this.present];
  }

  public add(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present + 1, this.stack.length - this.present - 1);
    }

    if (this.stack.length === MAX_STACK_LENGTH) {
      this.stack.shift();
      this.present--;
    }

    this.stack.push(assets);
    this.present++;
  }

  public replace(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present, this.stack.length - this.present - 1);
    }
    this.stack[this.present] = assets;
  }

  public clear() {
    this.present = -1;
    this.stack = [];
  }

  public setInitialLocation(v: DesignPageLocation) {
    if (this.stack.length === 1) {
      this.initialLocation = v;
    }
  }

  public canUndo = () => this.stack.length > 0 && this.present > 0;
  public canRedo = () => this.stack.length > 0 && this.present < this.stack.length - 1;
  public isEmpty = () => this.stack.length === 0;
  public getPresentAssets = () => (this.present > -1 ? this.stack[this.present] : null);
}

const undoHistory = new UndoHistory();
export default undoHistory;
