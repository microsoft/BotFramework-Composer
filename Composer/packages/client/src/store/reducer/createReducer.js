import producer from 'immer';

const createReducer = handlers => {
  return (state, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return producer(state, nextState => {
        handlers[action.type](nextState, action);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
