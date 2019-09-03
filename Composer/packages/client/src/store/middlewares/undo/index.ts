import { ActionTypes } from './../../../constants/index';
import { Store, ActionType, ActionCreator, State } from './../../types';
import undoHistory from './history';

export type MapStateToArgs = (state: State) => any[];

export const undoActionsMiddleware = ({ dispatch, getState }) => next => {
  return async (action: ActionType) => {
    if (action.type === ActionTypes.UNDO && undoHistory.canUndo()) {
      const undoStack = undoHistory.undo();
      const args = undoStack.undo();
      await undoStack.actionCreate({ dispatch, getState }, ...args);
      return;
    } else if (action.type === ActionTypes.REDO && undoHistory.canRedo()) {
      const redoStack = undoHistory.redo();
      const args = redoStack.redo();
      await redoStack.actionCreate({ dispatch, getState }, ...args);
      return;
    } else if (action.type === ActionTypes.HISTORY_CLEAR) {
      undoHistory.clear();
      return;
    }
    return next(action);
  };
};

export const undoable = (actionCreate: ActionCreator, mapStateToArgs: MapStateToArgs): ActionCreator => {
  const stack = undoHistory.createStack(actionCreate);

  return (store: Store, ...args: any[]) => {
    if (stack.isEmpty()) {
      const pastArgs = mapStateToArgs(store.getState());
      stack.add(pastArgs);
      undoHistory.add(stack.id);
    }
    stack.add(args);
    undoHistory.add(stack.id);
    return actionCreate(store, ...args);
  };
};

export { undoHistory };
