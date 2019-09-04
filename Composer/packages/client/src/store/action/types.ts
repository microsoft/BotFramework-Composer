import { ActionTypes } from '../../constants';

// Actions that have concrete types that should not be included in the generic type
type ConcreteActions =
  | ActionTypes.CREATE_DIALOG_SUCCESS
  | ActionTypes.SET_ERROR
  | ActionTypes.USER_LOGIN_SUCCESS
  | ActionTypes.USER_LOGIN_FAILURE
  | ActionTypes.USER_SESSION_EXPIRED;

export interface GenericActionType {
  type: Exclude<ActionTypes, ConcreteActions>;
  payload?: any;
  error?: any;
}

interface SetErrorActionType {
  type: ActionTypes.SET_ERROR;
  payload: {
    summary: string;
    message?: string;
  };
}

interface CreateDialogSuccessAction {
  type: ActionTypes.CREATE_DIALOG_SUCCESS;
  payload: { response: any };
}

// User Actions
export interface UserTokenPayload {
  token?: string | null;
}

interface UserLoginSuccessAction {
  type: ActionTypes.USER_LOGIN_SUCCESS;
  payload: {
    token: string | null;
  };
}

interface UserLoginFailureAction {
  type: ActionTypes.USER_LOGIN_FAILURE;
}

interface UserSessionExpiredAction {
  type: ActionTypes.USER_SESSION_EXPIRED;
  payload: {
    expired: boolean;
  };
}

export type ActionType =
  | SetErrorActionType
  | CreateDialogSuccessAction
  | UserLoginSuccessAction
  | UserLoginFailureAction
  | UserSessionExpiredAction
  | GenericActionType;
