import { INavState, initialNavState } from '../../../models/reduxState';
import { actionTypes, GenericAction } from '../../shared/actions';

export const NavReducer = (state: INavState = initialNavState, action: GenericAction<actionTypes, any>): INavState => {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_PATH:
      return {
        ...state,
        activePath: action.payload,
      };
    default:
      return state;
  }
};
