import producer from 'immer';

const createReducer = handlers => {
  return (state, action) => {
    const { type, payload, error } = action;

    if (handlers.hasOwnProperty(type)) {
      return producer(state, nextState => {
        handlers[type](nextState, payload, error ? error : null);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
