import { keys } from 'lodash';

import { ActionCreator } from '../../types';

import UndoStack from './stack';

class UndoHistory {
  private stacks: { [key: string]: UndoStack } = {};
  private history: string[] = [];
  private pointer: number = -1;

  public createStack(actionCreate: ActionCreator) {
    const stack = new UndoStack(actionCreate);
    this.stacks[stack.id] = stack;
    return stack;
  }

  public undo() {
    this.pointer--;
    return this.stacks[this.history[this.pointer]];
  }

  public redo() {
    this.pointer++;
    return this.stacks[this.history[this.pointer]];
  }

  public add(stackId: string) {
    const length = this.history.length;
    if (this.pointer < length - 1) {
      this.history.splice(this.pointer + 1, length - this.pointer);
    }
    this.history.push(stackId);
    this.pointer++;
  }

  public clear() {
    this.history = [];
    this.pointer = -1;
    keys(this.stacks).every(key => {
      this.stacks[key].clear();
    });
  }

  canUndo = () => this.pointer > 0;
  canRedo = () => this.pointer < this.history.length - 1;
}

const undoHistory = new UndoHistory();
export default undoHistory;
