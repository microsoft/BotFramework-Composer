// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import undoHistory from '../undoHistory';

import { dialogsState } from './../../atoms/botState';

describe('undoHistory class', () => {
  it('should add value to stack', () => {
    undoHistory.add(new Map().set(dialogsState, 'stack 1'));
    expect(undoHistory.canUndo()).toBeFalsy();
    undoHistory.add(new Map().set(dialogsState, 'stack 2'));
    expect(undoHistory.canUndo()).toBeTruthy();
    expect(undoHistory.getPresentAssets()?.get(dialogsState)).toBe('stack 2');
  });

  it('should do undo', () => {
    expect(undoHistory.canUndo()).toBeTruthy();
    const result = undoHistory.undo();
    expect(result.get(dialogsState)).toBe('stack 1');
    expect(undoHistory.stack.length).toBe(2);
  });

  it('should remove the tail stack value when add a new one after undo ', () => {
    undoHistory.add(new Map().set(dialogsState, 'stack 3'));
    expect(undoHistory.getPresentAssets()?.get(dialogsState)).toBe('stack 3');
    expect(undoHistory.stack.length).toBe(2);
  });

  it('should do redo', () => {
    expect(undoHistory.canRedo()).toBeFalsy();
    undoHistory.undo();
    expect(undoHistory.canRedo()).toBeTruthy();
    const result = undoHistory.redo();
    expect(result.get(dialogsState)).toBe('stack 3');
    expect(undoHistory.stack.length).toBe(2);
  });

  it('should replace the last stack value', () => {
    undoHistory.replace(new Map().set(dialogsState, 'stack 4'));
    expect(undoHistory.getPresentAssets()?.get(dialogsState)).toBe('stack 4');
    expect(undoHistory.stack.length).toBe(2);
  });

  it('should clear history', () => {
    undoHistory.clear();
    expect(undoHistory.stack.length).toBe(0);
  });

  it('should only support 30 history', () => {
    for (let i = 0; i < 40; i++) {
      undoHistory.add(new Map().set(dialogsState, `${i}`));
    }
    expect(undoHistory.stack.length).toBe(30);
    expect(undoHistory.getPresentAssets()?.get(dialogsState)).toBe('39');
    expect(undoHistory.stack[0].get(dialogsState)).toBe('10');
  });
});
