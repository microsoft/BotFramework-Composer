import producer from 'immer';

const createReducer = handlers => {
  return (state, action) => {
    const { type, payload } = action;

    if (handlers.hasOwnProperty(type)) {
      return producer(state, nextState => {
        handlers[type](nextState, payload);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
