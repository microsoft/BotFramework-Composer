import { uniqueId } from 'lodash';

import { ActionCreator } from '../../types';

const PREFIX = 'undoStack';

export default class UndoStack {
  private history: any[] = [];
  private pointer: number = -1;
  private _id: string;
  private _actionCreate: ActionCreator;

  constructor(actionCreate: ActionCreator) {
    this._id = uniqueId(PREFIX);
    this._actionCreate = actionCreate;
  }

  public get id() {
    return this._id;
  }

  public get actionCreate() {
    return this._actionCreate;
  }

  undo = () => {
    this.pointer--;
    return this.history[this.pointer];
  };

  redo = () => {
    this.pointer++;
    return this.history[this.pointer];
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
