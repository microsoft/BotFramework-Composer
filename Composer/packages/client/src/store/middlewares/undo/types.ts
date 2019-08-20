import { ActionCreator, State, ActionType } from './../../types';

export interface UndoConfig {
  revertibleActions: { [key: string]: revertibleAction };
}

export interface revertibleAction {
  actionCreator?: ActionCreator;
  mapStateToArgs?: MapStateToArgs;
}

export interface RevertibleState {
  state: State;
  action: ActionType;
}

export type MapStateToArgs = (action: ActionType, state: State) => any;
