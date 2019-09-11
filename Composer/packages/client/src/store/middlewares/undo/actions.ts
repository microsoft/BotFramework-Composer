import { Store } from '../../types';

import { ActionTypes } from './../../../constants/index';

export const undo = (store: Store) => store.dispatch({ type: ActionTypes.UNDO });
export const redo = (store: Store) => store.dispatch({ type: ActionTypes.REDO });

export const clearUndoHistory = (store: Store) => store.dispatch({ type: ActionTypes.HISTORY_CLEAR });
