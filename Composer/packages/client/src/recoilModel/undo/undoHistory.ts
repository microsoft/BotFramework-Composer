// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import uniqueId from 'lodash/uniqueId';

import { AtomAssetsMap } from './trackedAtoms';

export class UndoHistory {
  public stack: { assets: AtomAssetsMap; version: string }[] = [];
  public present = -1;
  public initialLocation = { dialogId: '', selected: '', focused: '', projectId: '' };

  public undo() {
    if (!this.canUndo()) throw new Error(formatMessage('Undo is not support'));

    this.present = this.present - 1;
    return this.stack[this.present].assets;
  }

  public redo() {
    if (!this.canRedo()) throw new Error(formatMessage('Redo is not support'));

    this.present = this.present + 1;
    return this.stack[this.present].assets;
  }

  public add(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present + 1, this.stack.length - this.present - 1);
    }
    this.stack.push({ assets, version: uniqueId() });
    this.present++;
  }

  public replace(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present, this.stack.length - this.present - 1);
    }
    this.stack[this.present].assets = assets;
  }

  public clear() {
    this.present = -1;
    this.stack = [];
  }

  public setInitialLocation(v: { dialogId: string; selected: string; focused: string; projectId: string }) {
    if (this.stack.length === 1) {
      this.initialLocation = v;
    }
  }

  public canUndo = () => this.stack.length > 0 && this.present > 0;
  public canRedo = () => this.stack.length > 0 && this.present < this.stack.length - 1;
  public isEmpty = () => this.stack.length === 0;
  public getPresentAssets = () => (this.present > -1 ? this.stack[this.present].assets : null);
  public getPresentVersion = () => (this.present > -1 ? this.stack[this.present].version : '');
}

const undoHistory = new UndoHistory();
export default undoHistory;
