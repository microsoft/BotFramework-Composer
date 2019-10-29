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
