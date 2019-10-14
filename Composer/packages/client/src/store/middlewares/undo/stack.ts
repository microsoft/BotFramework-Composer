import { uniqueId } from 'lodash';

import { ActionCreator, Store } from '../../types';

const PREFIX = 'undoStack';

export default class UndoStack {
  private history: any[] = [];
  private pointer = -1;
  private _id: string;
  private _undo: ActionCreator;
  private _redo: ActionCreator;

  constructor(undo: ActionCreator, redo: ActionCreator) {
    this._id = uniqueId(PREFIX);
    this._undo = undo;
    this._redo = redo;
  }

  public get id() {
    return this._id;
  }

  undo = async (store: Store) => {
    this.pointer--;
    return await this._undo(store, ...this.history[this.pointer]);
  };

  redo = async (store: Store) => {
    this.pointer++;
    return await this._redo(store, ...this.history[this.pointer]);
  };

  add = (state: any) => {
    const length = this.history.length;
    if (this.pointer < length - 1) {
      this.history.splice(this.pointer + 1, length - this.pointer);
    }
    this.history.push(state);
    this.pointer++;
  };

  clear = () => {
    this.history = [];
    this.pointer = -1;
  };

  canUndo = () => this.pointer > 0;
  canRedo = () => this.pointer < this.history.length - 1;
  isEmpty = () => !this.canRedo() && !this.canUndo();
}
