import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { initialAppState } from '../../models/reduxState';
import { reducers } from '../../rootReducer';

export const store = createStore(reducers, initialAppState, composeWithDevTools());
