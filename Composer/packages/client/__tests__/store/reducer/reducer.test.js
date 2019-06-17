import { ActionTypes, FileTypes } from '../../../src/constants/index';
import { reducer } from '../../../src/store/reducer/index';

const mockResponse = {
  data: {
    dialogs: 'test dialogs',
    botFile: 'test botFile',
    lgFiles: 'test lgFiles',
    schemas: 'test schemas',
  },
};

describe('test all reducer handlers', () => {
  it('test getProjectSuccess reducer', () => {
    const result = reducer({}, { type: ActionTypes.GET_PROJECT_SUCCESS, payload: { response: mockResponse } });
    expect(result.dialogs).toBe('test dialogs');
    expect(result.botProjFile).toBe('test botFile');
    expect(result.lgFiles).toBe('test lgFiles');
    expect(result.schemas).toBe('test schemas');
  });
  it('test updateDialog reducer', () => {
    const result = reducer({}, { type: ActionTypes.UPDATE_DIALOG, payload: { response: mockResponse } });
    expect(result.dialogs).toBe('test dialogs');
  });
  it('test createDialogSuccess reducer', () => {
    const result = reducer({}, { type: ActionTypes.CREATE_DIALOG_SUCCESS, payload: { response: mockResponse } });
    expect(result.dialogs).toBe('test dialogs');
  });
  it('test updateLgTemplate reducer', () => {
    const result = reducer({}, { type: ActionTypes.UPDATE_LG_SUCCESS, payload: { response: mockResponse } });
    expect(result.lgFiles).toBe('test lgFiles');
  });
  it('test updateProjFile reducer', () => {
    const result = reducer({}, { type: ActionTypes.UPDATE_PROJFILE__SUCCESS, payload: { response: mockResponse } });
    expect(result.botProjFile).toBe('test botFile');
  });
  it('test setBotStatus reducer', () => {
    const result = reducer({}, { type: ActionTypes.SET_BOT_STATUS_SUCCESS, payload: { status: 'mock status' } });
    expect(result.botStatus).toBe('mock status');
  });
  it('test getStorageFileSuccess reducer', () => {
    const mockStorageFile = {
      data: {
        children: [
          {
            type: FileTypes.FOLDER,
            path: 'mock path',
          },
          {
            type: FileTypes.FILE,
            path: 'a.bot',
          },
          {
            type: FileTypes.FILE,
            path: 'mock path',
          },
        ],
      },
    };
    const result = reducer({}, { type: ActionTypes.GET_STORAGEFILE_SUCCESS, payload: { response: mockStorageFile } });
    expect(result.storageFileLoadingStatus).toBe('success');
    expect(result.focusedStorageFolder).toEqual(expect.objectContaining({ children: expect.any(Array) }));
    expect(result.focusedStorageFolder.children).toHaveLength(2);
  });
  it('test navigateTo reducer', () => {
    const result = reducer({ navPathHistory: [] }, { type: ActionTypes.NAVIGATE_TO, payload: { path: 'mock path' } });
    expect(result.focusPath).toBe('mock path');
    expect(result.navPath).toBe('mock path');
    expect(result.navPathHistory).toHaveLength(1);
  });
  it('test navigateDown reducer', () => {
    const result = reducer(
      { navPath: '', navPathHistory: [] },
      { type: ActionTypes.NAVIGATE_DOWN, payload: { subPath: 'mock path' } }
    );
    expect(result.focusPath).toBe('mock path');
    expect(result.navPath).toBe('mock path');
    expect(result.navPathHistory).toHaveLength(1);
  });
  it('test focusTo reducer', () => {
    const result = reducer({ navPath: '' }, { type: ActionTypes.FOCUS_TO, payload: { path: 'mock path' } });
    expect(result.focusPath).toBe('mock path');
  });
  it('test clearNavHistory reducer', () => {
    const result = reducer(
      { navPathHistory: ['mock path1', 'mock path2'] },
      { type: ActionTypes.CLEAR_NAV_HISTORY, payload: { fromIndex: 0 } }
    );
    expect(result.navPathHistory.length).toBe(0);
  });
});
