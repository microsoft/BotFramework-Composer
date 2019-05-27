import { ActionTypes } from '../../../src/constants/index';
import { reducer } from '../../../src/store/reducer/index';
describe('test all reducer handlers', () => {
  it('test closeCurrentProject reducer', () => {
    const result = reducer({}, { type: ActionTypes.INIT_PROJECT_STATE });
    expect(result.editors.length).toBe(0);
  });
  it('test getProjectSuccess reducer', () => {
    const mockResponse = {
      data: {
        dialogs: 'test dialogs',
        botFile: 'test botFile',
        lgFiles: 'test lgFiles',
        schemas: 'test schemas',
      },
    };
    const result = reducer({}, { type: ActionTypes.GET_PROJECT_SUCCESS, payload: { response: mockResponse } });
    expect(result.dialogs).toBe('test dialogs');
    expect(result.botProjFile).toBe('test botFile');
    expect(result.lgFiles).toBe('test lgFiles');
    expect(result.schemas).toBe('test schemas');
  });
});
