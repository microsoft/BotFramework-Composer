import React from 'react';
import { reverse } from 'lodash';

import { ActionTypes } from './../../../constants/index';
import { Store, ActionType, ActionCreator } from './../../types';
import undoHistory from './history';
import { UndoConfig, RevertibleState } from './types';

const dispatchActions = (dispatch: React.Dispatch<ActionType>, ...args) => (action: ActionType | ActionCreator) => {
  if (typeof action === 'function') {
    return action({ dispatch: dispatchActions(dispatch) } as Store, ...args);
  } else {
    return dispatch({ ...action, undoSkipAction: true });
  }
};

const revertState = async (revertingStates: RevertibleState[], config: UndoConfig, dispatch) => {
  for (const revertingState of revertingStates) {
    const { action, state } = revertingState;
    const revertingAction = config.revertibleActions[action.type];
    if (revertingAction.actionCreator && revertingAction.mapStateToArgs) {
      const { actionCreator, mapStateToArgs } = revertingAction;
      const args = mapStateToArgs(action, state);
      dispatchActions(dispatch, args)(actionCreator);
    }
  }
};

export const undoActionsMiddleware = config => {
  return ({ dispatch, getState }) => next => {
    return async (action: ActionType) => {
      const presentState = getState();
      if (action.undoSkipAction) {
        return next(action);
      }

      if (action.type in config.revertibleActions) {
        undoHistory.add(presentState, action);
        return dispatchActions(dispatch)(action);
      } else if (action.type === ActionTypes.UNDO && undoHistory.canUndo()) {
        const revertingStates = undoHistory.getPastHistoryItem();
        undoHistory.undo(presentState, revertingStates);
        //if undo the revert order is from end to start.
        reverse(revertingStates);
        revertState(revertingStates, config, dispatch);
      } else if (action.type === ActionTypes.REDO && undoHistory.canRedo()) {
        const revertingStates = undoHistory.getFutureHistoryItem();
        undoHistory.redo(presentState, revertingStates);
        revertState(revertingStates, config, dispatch);
      } else if (action.type === ActionTypes.HISTORY_CLEAR) {
        undoHistory.clear();
        return;
      }
      return next(action);
    };
  };
};

export { undoHistory };
