import undoHistory from './../../../../src/store/middlewares/undo/history';

describe('test undo history', () => {
  it('test undo history', async () => {
    const mockStack1Undo = jest.fn((store, args) => args);
    const mockStack1Redo = jest.fn((store, args) => args);
    const mockStack2Undo = jest.fn((store, args) => args);
    const mockStack2Redo = jest.fn((store, args) => args);
    const stack1 = undoHistory.createStack(mockStack1Undo, mockStack1Redo);
    const stack2 = undoHistory.createStack(mockStack2Undo, mockStack2Redo);
    stack1.add(['t0']);
    stack1.add(['t1']);
    undoHistory.add(stack1.id);
    stack2.add(['t_0']);
    stack2.add(['t_1']);
    undoHistory.add(stack2.id);
    expect(undoHistory.canUndo()).toBe(true);
    expect(undoHistory.canRedo()).toBe(false);
    for (const stack of undoHistory.undo()) {
      expect(await stack.undo({})).toBe('t_0');
      expect(mockStack2Undo.mock.calls.length).toBe(1);
    }
    expect(undoHistory.canRedo()).toBe(true);
    for (const stack of undoHistory.undo()) {
      expect(await stack.undo({})).toBe('t0');
      expect(mockStack1Undo.mock.calls.length).toBe(1);
    }
    expect(undoHistory.canUndo()).toBe(false);
    for (const stack of undoHistory.redo()) {
      expect(await stack.redo({})).toBe('t1');
      expect(mockStack1Redo.mock.calls.length).toBe(1);
    }
    expect(undoHistory.canUndo()).toBe(true);
    for (const stack of undoHistory.redo()) {
      expect(await stack.redo({})).toBe('t_1');
      expect(mockStack2Redo.mock.calls.length).toBe(1);
    }
    expect(undoHistory.canRedo()).toBe(false);
    for (const stack of undoHistory.undo()) {
      expect(await stack.undo({})).toBe('t_0');
    }
    expect(undoHistory.canRedo()).toBe(true);
    stack2.add(['t_3']);
    undoHistory.add(stack2.id);
    expect(undoHistory.canRedo()).toBe(false);
  });
});
