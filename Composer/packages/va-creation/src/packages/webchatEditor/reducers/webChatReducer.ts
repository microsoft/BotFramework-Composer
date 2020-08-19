import { initialWebChatState, IWebChatState, WebChatStyleOption } from '../../../models/reduxState';
import { actionTypes, GenericAction } from '../../shared/actions';

export function updateStyleElement(
  state: IWebChatState,
  styleElementName: string,
  value: boolean | string
): IWebChatState {
  return {
    ...state,
    styleOptions: {
      ...state.styleOptions,
      [styleElementName]: value,
    },
  };
}

export function updateRootStateVariable(state: IWebChatState, stateVariableName: string, value: any): IWebChatState {
  return {
    ...state,
    [stateVariableName]: value,
  };
}

export function updateStyleOptions(state: IWebChatState, styleOptions: WebChatStyleOption): IWebChatState {
  return {
    ...state,
    styleOptions: styleOptions,
  };
}

export const WebChatReducer = (
  state: IWebChatState = initialWebChatState,
  action: GenericAction<actionTypes, any>
): IWebChatState => {
  switch (action.type) {
    case 'UPDATE_STYLE_ELEMENT':
      return updateStyleElement(state, action.payload.styleElementName, action.payload.value);
    case 'UPDATE_STYLE_OPTIONS':
      return updateStyleOptions(state, action.payload);
    case 'UPDATE_ROOT_WEBCHAT_STATE_VARIABlE':
      return updateRootStateVariable(state, action.payload.propertyName, action.payload.value);
    default:
      return state;
  }
};
