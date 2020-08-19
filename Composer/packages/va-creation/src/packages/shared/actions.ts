export enum actionTypes {
  // nav action types
  SET_ACTIVE_PATH = 'SET_ACTIVE_PATH',

  // webchat styling action types
  UPDATE_STYLE_OPTIONS = 'UPDATE_STYLE_OPTIONS',
  UPDATE_STYLE_ELEMENT = 'UPDATE_STYLE_ELEMENT',
  UPDATE_ROOT_WEBCHAT_STATE_VARIABlE = 'UPDATE_ROOT_WEBCHAT_STATE_VARIABlE',

  // creation Experience action types
  UPDATE_ROOT_CREATION_STATE_VARIABlE = 'UPDATE_ROOT_CREATION_STATE_VARIABlE',
}

export function genericSingleAction<T>(actionName: actionTypes, property?: T): GenericAction<actionTypes, T> {
  return {
    type: actionName,
    payload: property,
  };
}

export class GenericAction<ActionType, PayloadType> {
  constructor(type: ActionType, payload?: PayloadType) {
    this.type = type;
    this.payload = payload;
  }

  type: ActionType;
  payload?: PayloadType;
}
