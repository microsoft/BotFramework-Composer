import { ActionTypes } from './../../../constants/index';
import { Store, ActionType, ActionCreator, State } from './../../types';
import undoHistory from './history';

export type MapStateToArgs = (state: State) => { [key: string]: any };

export const undoActionsMiddleware = ({ dispatch, getState }) => next => {
  return async (action: ActionType) => {
    if (action.type === ActionTypes.UNDO && undoHistory.canUndo()) {
      const undoStacks = undoHistory.undo();
      for (const stack of undoStacks) {
        const args = stack.undo();
        await stack.actionCreate({ dispatch, getState }, args);
      }
      return;
    } else if (action.type === ActionTypes.REDO && undoHistory.canRedo()) {
      const redoStacks = undoHistory.redo();
      for (const stack of redoStacks) {
        const args = stack.redo();
        await stack.actionCreate({ dispatch, getState }, args);
      }
      return;
    } else if (action.type === ActionTypes.HISTORY_CLEAR) {
      undoHistory.clear();
      return;
    }
    return next(action);
  };
};

export const undoable = (
  actionCreate: ActionCreator,
  mapStateToArgs: MapStateToArgs,
  revertActionCreate?: ActionCreator
): ActionCreator => {
  //revertActionCreate is used to do some side effect
  const stack = undoHistory.createStack(!revertActionCreate ? actionCreate : revertActionCreate);

  return (store: Store, args) => {
    //operatioId is used to sign the same state actions as user action.
    const { operationId } = args;

    if (stack.isEmpty()) {
      const pastArgs = mapStateToArgs(store.getState());
      stack.add(pastArgs);
      undoHistory.add(stack.id, operationId);
    }
    stack.add(args);
    undoHistory.add(stack.id, operationId);
    return actionCreate(store, args);
  };
};

export { undoHistory };
