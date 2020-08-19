import {
  INavState,
  initialNavState,
  initialWebChatState,
  IWebChatState,
  ICreationState,
  initialCreationState,
} from '../../../models/reduxState';
import { GenericAction, actionTypes } from '../../shared/actions';

export function updateRootStateVariable(state: ICreationState, stateVariableName: string, value: any): ICreationState {
  console.log('in here 2');
  return {
    ...state,
    [stateVariableName]: value,
  };
}

export const CreationExperienceReducer = (
  state: ICreationState = initialCreationState,
  action: GenericAction<actionTypes, any>
): ICreationState => {
  switch (action.type) {
    case actionTypes.UPDATE_ROOT_CREATION_STATE_VARIABlE:
      return updateRootStateVariable(state, action.payload.propertyName, action.payload.value);
    default:
      return state;
  }
};
