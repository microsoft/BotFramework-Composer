import { ActionTypes } from '../../constants';

interface GenericActionType {
  type: Exclude<ActionTypes, ActionTypes.CREATE_DIALOG_SUCCESS | ActionTypes.SET_ERROR>;
  payload?: any;
  error?: any;
}

type SetErrorActionType = {
  type: ActionTypes.SET_ERROR;
  payload: {
    summary: string;
    message?: string;
  };
};

type AnotherAction = {
  type: ActionTypes.CREATE_DIALOG_SUCCESS;
  payload: { response: any };
};

export type ActionType = SetErrorActionType | AnotherAction | GenericActionType;
