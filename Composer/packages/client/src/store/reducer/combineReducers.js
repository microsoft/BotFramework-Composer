export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  const finalReducerKeys = reducerKeys.filter(key => {
    return typeof reducers[key] === 'function';
  });

  return function combination(state = {}, action) {
    const nextState = {};
    finalReducerKeys.forEach(key => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
    });

    return nextState;
  };
}
