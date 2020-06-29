// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Store } from '../../types';
import { ActionTypes } from '../../../constants';

export const undo = (store: Store) => store.dispatch({ type: ActionTypes.UNDO });
export const redo = (store: Store) => store.dispatch({ type: ActionTypes.REDO });

export const clearUndoHistory = (store: Store) => store.dispatch({ type: ActionTypes.HISTORY_CLEAR });
