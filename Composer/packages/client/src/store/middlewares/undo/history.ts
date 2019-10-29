/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
