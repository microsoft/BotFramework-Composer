import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { filesStorage } from './reducer/files';
import rootSaga from './sagas/index';

//split reducing function
const reducers = combineReducers({
  filesStorage: filesStorage,
});

//check redux devtool
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

//use redux-saga to manage application side effects
const sagaMiddleware = createSagaMiddleware();

const middleware = [sagaMiddleware];

const store = createStore(reducers, composeEnhancer(applyMiddleware(...middleware)));

sagaMiddleware.run(rootSaga);

export default store;
