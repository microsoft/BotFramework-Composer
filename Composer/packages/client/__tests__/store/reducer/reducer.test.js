// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes, FileTypes } from '../../../src/constants';
import { reducer } from '../../../src/store/reducer/index';

const mockResponse = {
  data: {
    files: ['test files'],
    schemas: 'test schemas',
  },
};

describe('test all reducer handlers', () => {
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

  it('remove lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1' }, { id: '2' }] },
      { type: ActionTypes.REMOVE_LG, payload: { id: '1' } }
    );
    expect(result.lgFiles.length).toBe(1);
    expect(result.lgFiles[0].id).toBe('2');
  });

  it('create lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1' }, { id: '2' }], locale: 'en-us' },
      { type: ActionTypes.CREATE_LG, payload: { id: '3', content: '' } }
    );
    expect(result.lgFiles.length).toBe(3);
    expect(result.lgFiles[2].id).toBe('3.en-us');
  });

  it('update lg file', () => {
    const result = reducer(
      { lgFiles: [{ id: '1', content: 'old' }, { id: '2' }] },
      { type: ActionTypes.UPDATE_LG, payload: { id: '1', content: 'new' } }
    );
    expect(result.lgFiles.length).toBe(2);
    expect(result.lgFiles[0].content).toBe('new');
  });

  it('remove dialog file', () => {
    const result = reducer(
      { dialogs: [{ id: '1' }, { id: '2' }], lgFiles: [{ id: '1' }], luFiles: [{ id: '1' }] },
      { type: ActionTypes.REMOVE_DIALOG, payload: { id: '1' } }
    );
    expect(result.dialogs.length).toBe(1);
    expect(result.dialogs[0].id).toBe('2');
    expect(result.luFiles.length).toBe(0);
    expect(result.lgFiles.length).toBe(0);
  });

  it('create dialog file', () => {
    const result = reducer(
      {
        dialogs: [{ id: '1' }, { id: '2' }],
        locale: 'en-us',
        lgFiles: [],
        luFiles: [],
        schemas: { sdk: { content: {} } },
      },
      { type: ActionTypes.CREATE_DIALOG, payload: { id: '3', content: '' } }
    );
    expect(result.dialogs.length).toBe(3);
    expect(result.dialogs[2].id).toBe('3');
    expect(result.luFiles.length).toBe(1);
    expect(result.lgFiles.length).toBe(1);
  });

  it('update dialog file', () => {
    const result = reducer(
      { dialogs: [{ id: '1', content: 'old' }, { id: '2' }], schemas: { sdk: { content: {} } } },
      { type: ActionTypes.UPDATE_DIALOG, payload: { id: '1', content: 'new' } }
    );
    expect(result.dialogs.length).toBe(2);
    expect(result.dialogs[0].content).toBe('new');
  });

  it('get project pending status', () => {
    const result = reducer({ botOpening: false }, { type: ActionTypes.GET_PROJECT_PENDING });
    expect(result.botOpening).toBeTruthy();
  });

  it('get project failure ', () => {
    const result = reducer(
      { error: {}, botOpening: true },
      { type: ActionTypes.GET_PROJECT_FAILURE, payload: { error: { status: 409, response: {} } } }
    );
    expect(result.botOpening).toBeFalsy();
    expect(result.error.summary).toBe('Modification Rejected');

    const result1 = reducer(
      { error: {}, botOpening: true },
      { type: ActionTypes.GET_PROJECT_FAILURE, payload: { error: { response: { data: { message: 'error' } } } } }
    );
    expect(result1.botOpening).toBeFalsy();
    expect(result1.error.message).toBe('error');
  });

  it('get recent project list', () => {
    const result = reducer(
      { recentProjects: [] },
      { type: ActionTypes.GET_RECENT_PROJECTS_SUCCESS, payload: { response: { data: [1, 2, 3] } } }
    );
    expect(result.recentProjects.length).toBe(3);
  });

  it('remove recent project from list', () => {
    const result = reducer(
      { recentProjects: [{ path: 1 }, { path: 2 }] },
      { type: ActionTypes.REMOVE_RECENT_PROJECT, payload: { path: 1 } }
    );
    expect(result.recentProjects.length).toBe(1);
    expect(result.recentProjects[0].path).toBe(2);
  });

  it('update lu template', () => {
    const result = reducer(
      { luFiles: [{ id: 1, content: '1' }], botName: '1' },
      { type: ActionTypes.UPDATE_LU, payload: { id: 1, content: '2' } }
    );
    expect(result.luFiles[0].content).toBe('2');
  });

  it('create dialog begin', () => {
    const result = reducer(
      { showCreateDialogModal: false, actionsSeed: {}, onCreateDialogComplete: null },
      { type: ActionTypes.CREATE_DIALOG_BEGIN, payload: { actionsSeed: { a: 'a' }, onComplete: () => {} } }
    );
    expect(result.showCreateDialogModal).toBeTruthy();
    expect(result.actionsSeed.a).toBe('a');
  });

  it('create dialog cancel', () => {
    const result = reducer(
      { showCreateDialogModal: true, onCreateDialogComplete: () => {} },
      { type: ActionTypes.CREATE_DIALOG_CANCEL }
    );
    expect(result.showCreateDialogModal).toBeFalsy();
    expect(result.onCreateDialogComplete).toBeUndefined();
  });

  it('public luis success', () => {
    const result = reducer({ botStatus: 'unConnected' }, { type: ActionTypes.PUBLISH_LU_SUCCCESS });
    expect(result.botStatus).toBe('published');
  });

  it('public luis failure', () => {
    const result = reducer(
      { botStatus: 'unConnected', botLoadErrorMsg: '' },
      { type: ActionTypes.PUBLISH_LU_FAILED, payload: 'error' }
    );
    expect(result.botStatus).toBe('failed');
    expect(result.botLoadErrorMsg).toBe('error');
  });

  it('public luis failure', () => {
    const result = reducer(
      { storageFileLoadingStatus: '' },
      { type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS, payload: { status: 'success' } }
    );
    expect(result.storageFileLoadingStatus).toBe('success');
  });

  it('set bot load error msg', () => {
    const result = reducer({ botLoadErrorMsg: '' }, { type: ActionTypes.RELOAD_BOT_FAILURE, payload: 'error' });
    expect(result.botLoadErrorMsg).toBe('error');
  });

  it('set creation flow status', () => {
    const result = reducer(
      { creationFlowStatus: 'create' },
      { type: ActionTypes.SET_CREATION_FLOW_STATUS, payload: { creationFlowStatus: 'open' } }
    );
    expect(result.creationFlowStatus).toBe('open');
  });

  it('save template id', () => {
    const result = reducer({ templateId: '1' }, { type: ActionTypes.SAVE_TEMPLATE_ID, payload: {} });
    expect(result.templateId).toBe('1');

    const result1 = reducer({ templateId: '1' }, { type: ActionTypes.SAVE_TEMPLATE_ID, payload: { templateId: '2' } });
    expect(result1.templateId).toBe('2');
  });

  it('set design page location', () => {
    const result = reducer(
      {
        focusPath: '',
        breadcrumb: [],
        designPageLocation: {
          projectId: '1',
          dialogId: 'main',
          selected: 'triggers[5]',
          focused: 'triggers[5].actions[6]',
          promptTab: 'botAsk',
        },
      },
      {
        type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
        payload: {
          projectId: '1',
          dialogId: 'main',
          selected: 'triggers[0]',
          focused: 'triggers[0].actions[0]',
          breadcrumb: [],
          promptTab: 'botAsk',
        },
      }
    );
    expect(result.focusPath).toBe('main#.triggers[0].actions[0]');
    expect(result.breadcrumb[0].dialogId).toBe('main');
  });

  it('update skill', () => {
    const result = reducer(
      { settings: { skill: [] }, showAddSkillDialogModal: true, onAddSkillDialogComplete: () => {} },
      { type: ActionTypes.UPDATE_SKILL_SUCCESS, payload: { skills: [{ manifestUrl: '1', name: '1' }] } }
    );
    expect(result.showAddSkillDialogModal).toBe(false);
    expect(result.onAddSkillDialogComplete).toBeUndefined();
  });

  it('add skill begin', () => {
    const result = reducer(
      { showAddSkillDialogModal: false, onAddSkillDialogComplete: null },
      { type: ActionTypes.ADD_SKILL_DIALOG_BEGIN, payload: { onComplete: () => {} } }
    );
    expect(result.showAddSkillDialogModal).toBeTruthy();
  });

  it('add skill cancel', () => {
    const result = reducer(
      { showAddSkillDialogModal: true, onAddSkillDialogComplete: () => {} },
      { type: ActionTypes.ADD_SKILL_DIALOG_END }
    );
    expect(result.showAddSkillDialogModal).toBeFalsy();
    expect(result.onAddSkillDialogComplete).toBeUndefined();
  });

  it('create skill manifest', () => {
    const result = reducer(
      { skillManifests: [{ id: '1', content: {} }] },
      { type: ActionTypes.CREATE_SKILL_MANIFEST, payload: { id: '2' } }
    );
    expect(result.skillManifests[1].id).toBe('2');
  });

  it('update skill manifest', () => {
    const result = reducer(
      { skillManifests: [{ id: '1', content: {} }] },
      { type: ActionTypes.UPDATE_SKILL_MANIFEST, payload: { id: '1', content: { a: 'a' } } }
    );
    expect(result.skillManifests[0].content.a).toBe('a');
  });

  it('remove skill manifest', () => {
    const result = reducer(
      { skillManifests: [{ id: '1', content: {} }] },
      { type: ActionTypes.REMOVE_SKILL_MANIFEST, payload: { id: '1' } }
    );
    expect(result.skillManifests.length).toBe(0);
  });

  it('display skill manifest', () => {
    const result = reducer(
      { displaySkillManifest: undefined },
      { type: ActionTypes.DISPLAY_SKILL_MANIFEST_MODAL, payload: { id: '1' } }
    );
    expect(result.displaySkillManifest).toBe('1');
  });

  it('dismiss skill manifest', () => {
    const result = reducer(
      { displaySkillManifest: undefined },
      { type: ActionTypes.DISMISS_SKILL_MANIFEST_MODAL, payload: { id: '1' } }
    );
    expect(result.displaySkillManifest).toBeUndefined();
  });
});
