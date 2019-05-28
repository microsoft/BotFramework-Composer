import createReducer from '../../../src/store/reducer/createReducer';
describe('test create reducer', () => {
  it('test create reducer with mock action and handler', () => {
    const mockActionHandler = jest.fn((state, payload) => {
      state.a = payload.a;
    });
    const reducer = createReducer({
      mockActionType: mockActionHandler,
    });
    // test else branch
    const mockState = { a: 2 };
    const result = reducer(mockState, { type: 'newActionTypeWithoutReducer', payload: 'mock' });
    expect(result).toBe(mockState);
    // test if branch
    const state = reducer(mockState, { type: 'mockActionType', payload: { a: 1 } });
    expect(mockActionHandler).toBeCalled();
    expect(state).not.toBe(mockState);
    expect(state.a).toEqual(1);
  });
});
