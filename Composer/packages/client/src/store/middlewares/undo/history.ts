import { keys } from 'lodash';

import { ActionCreator } from '../../types';

import UndoStack from './stack';

interface History {
  stackId: string;
  operationId: string | undefined;
}

class UndoHistory {
  private stacks: { [key: string]: UndoStack } = {};
  private history: History[] = [];
  private pointer = -1;
  private _limit = 5;

  public createStack(undo: ActionCreator, redo: ActionCreator) {
    const stack = new UndoStack(undo, redo);
    this.stacks[stack.id] = stack;
    return stack;
  }

  public undo() {
    const operationId = this.history[this.pointer].operationId;
    const result = [this.stacks[this.history[this.pointer--].stackId]];
    if (operationId === undefined) return result;
    while (this.pointer > -1 && this.history[this.pointer].operationId === operationId) {
      result.push(this.stacks[this.history[this.pointer].stackId]);
      this.pointer--;
    }
    return result;
  }

  public redo() {
    this.pointer++;
    const operationId = this.history[this.pointer].operationId;
    const result = [this.stacks[this.history[this.pointer].stackId]];
    if (operationId === undefined) return result;
    while (this.pointer < this.history.length - 1 && this.history[this.pointer + 1].operationId === operationId) {
      this.pointer++;
      result.push(this.stacks[this.history[this.pointer].stackId]);
    }
    return result;
  }

  public add(stackId: string, operationId: string | undefined) {
    const length = this.history.length;
    if (this.pointer < length - 1) {
      this.history.splice(this.pointer + 1, length - this.pointer);
    }
    this.history.push({ stackId, operationId });
    this.pointer++;
  }

  public clear() {
    this.history = [];
    this.pointer = -1;
    keys(this.stacks).every(key => {
      this.stacks[key].clear();
    });
  }

  public set limit(limit: number) {
    this._limit = limit;
  }

  canUndo = () => this.pointer > -1;
  canRedo = () => this.pointer < this.history.length - 1;
}

const undoHistory = new UndoHistory();
export default undoHistory;
