import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const resetVisualEditor: ActionCreator = ({ dispatch }, { isReset }) => {
  dispatch({
    type: ActionTypes.EDITOR_RESET_VISUAL,
    payload: { isReset },
  });
};
