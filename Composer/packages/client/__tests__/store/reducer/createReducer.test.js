import createReducer from '../../../src/store/reducer/createReducer';
describe('test create reducer', () => {
  it('test create reducer with mock action and handler', () => {
    const mockActionHandler = jest.fn((state, payload) => {
      state.payload = payload;
      return state;
    });
    const reducer = createReducer({
      ['mockActionType']: mockActionHandler,
    });
    const result = reducer({}, { type: 'mockActionType', payload: 'mockpayload' });
    expect(mockActionHandler).toBeCalled();
    expect(result.payload).toBe('mockpayload');
  });
});
