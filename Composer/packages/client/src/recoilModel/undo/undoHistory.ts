// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { RecoilState } from 'recoil';
import uniqueId from 'lodash/uniqueId';

import { AtomAssetsMap } from './trackedAtoms';

// use number to limit the stack size first
const MAX_STACK_LENGTH = 30;
type undoStackType = {
  version: string;
  atomMaps: AtomAssetsMap;
};

export default class {
  private _projectId = '';
  /**
   *
   */
  constructor(projectId) {
    this._projectId = projectId;
  }

  public stack: undoStackType[] = [];
  public present = -1;

  public undo() {
    if (!this.canUndo()) throw new Error(formatMessage('Undo is not supported'));

    this.present = this.present - 1;
    return this.stack[this.present].atomMaps;
  }

  public redo() {
    if (!this.canRedo()) throw new Error(formatMessage('Redo is not supported'));

    this.present = this.present + 1;
    return this.stack[this.present].atomMaps;
  }

  public add(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present + 1, this.stack.length - this.present - 1);
    }

    if (this.stack.length === MAX_STACK_LENGTH) {
      this.stack.shift();
      this.present--;
    }
    const version = uniqueId('undo-');
    this.stack.push({ version, atomMaps: assets });

    this.present++;
    return version;
  }

  public replace(assets: AtomAssetsMap) {
    if (this.present !== -1 && this.canRedo()) {
      this.stack.splice(this.present, this.stack.length - this.present - 1);
    }
    this.stack[this.present].atomMaps = assets;
  }

  public update(commitVersion: string, assets: AtomAssetsMap) {
    this.stack = this.stack.map((item) => {
      if (item.version === commitVersion) {
        item.atomMaps = assets;
      }
      return item;
    });
  }

  public clear() {
    this.present = -1;
    this.stack = [];
  }

  public setInitialValue(atom: RecoilState<any>, v: any) {
    if (this.stack.length === 1) {
      this.stack[0].atomMaps.set(atom, v);
    }
  }

  public canUndo = () => {
    return this.stack.length > 0 && this.present > 0;
  };
  public canRedo = () => this.stack.length > 0 && this.present < this.stack.length - 1;
  public isEmpty = () => this.stack.length === 0;
  public getPresentAssets = () => (this.present > -1 ? this.stack[this.present].atomMaps : null);
  public getAssets = (commitVersion: string) => this.stack.find((item) => item.version === commitVersion)?.atomMaps;

  public get projectId() {
    return this._projectId;
  }
}
