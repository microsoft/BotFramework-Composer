// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';
import { useRecoilState } from 'recoil';

import httpClient from '../../../utils/httpUtil';
import { projectDispatcher } from '../project';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  recentProjectsState,
  applicationErrorState,
  templateIdState,
  announcementState,
  boilerplateVersionState,
  templateProjectsState,
  runtimeTemplatesState,
  currentProjectIdState,
  skillManifestsState,
  luFilesState,
  lgFilesState,
  settingsState,
  dialogsState,
  botEnvironmentState,
  botDiagnosticsState,
  localeState,
  schemasState,
  locationState,
  skillsState,
  botStatusState,
  botNameState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '../../dispatchers';
import { BotStatus } from '../../../constants';

import mockProjectResponse from './mocks/mockProjectResponse.json';

// let httpMocks;
let navigateTo;

const projectId = '30876.502871204648';

jest.mock('../../../utils/navigation', () => {
  const navigateMock = jest.fn();
  navigateTo = navigateMock;
  return {
    navigateTo: navigateMock,
  };
});

jest.mock('../../../utils/httpUtil');

jest.mock('../../parsers/lgWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
    addProject: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../persistence/FilePersistence', () => {
  return jest.fn().mockImplementation(() => {
    return { flush: () => new Promise((resolve) => resolve()) };
  });
});

describe('Project dispatcher', () => {
  const useRecoilTestHook = () => {
    const schemas = useRecoilValue(schemasState(projectId));
    const location = useRecoilValue(locationState(projectId));
    const skills = useRecoilValue(skillsState(projectId));
    const botName = useRecoilValue(botNameState(projectId));
    const skillManifests = useRecoilValue(skillManifestsState(projectId));
    const luFiles = useRecoilValue(luFilesState(projectId));
    const lgFiles = useRecoilValue(lgFilesState(projectId));
    const settings = useRecoilValue(settingsState(projectId));
    const dialogs = useRecoilValue(dialogsState(projectId));
    const botEnvironment = useRecoilValue(botEnvironmentState(projectId));
    const diagnostics = useRecoilValue(botDiagnosticsState(projectId));
    const locale = useRecoilValue(localeState(projectId));
    const botStatus = useRecoilValue(botStatusState(projectId));

    const currentDispatcher = useRecoilValue(dispatcherState);
    const [recentProjects, setRecentProjects] = useRecoilState(recentProjectsState);
    const appError = useRecoilValue(applicationErrorState);
    const templateId = useRecoilValue(templateIdState);
    const announcement = useRecoilValue(announcementState);
    const boilerplateVersion = useRecoilValue(boilerplateVersionState);
    const templates = useRecoilValue(templateProjectsState);
    const runtimeTemplates = useRecoilValue(runtimeTemplatesState);

    return {
      skillManifests,
      luFiles,
      lgFiles,
      settings,
      dialogs,
      botEnvironment,
      botName,
      botStatus,
      skills,
      location,
      schemas,
      diagnostics,
      projectId,
      locale,
      currentDispatcher,
      recentProjects,
      appError,
      setRecentProjects,
      templateId,
      announcement,
      boilerplateVersion,
      templates,
      runtimeTemplates,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    navigateTo.mockReset();
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [{ recoilState: currentProjectIdState, initialValue: projectId }],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            projectDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should open bot project', async () => {
    let result;
    (httpClient.put as jest.Mock).mockResolvedValueOnce({
      data: mockProjectResponse,
    });
    await act(async () => {
      result = await dispatcher.openProject('../test/empty-bot', 'default');
    });

    expect(renderedComponent.current.projectId).toBe(mockProjectResponse.id);
    expect(renderedComponent.current.botName).toBe(mockProjectResponse.botName);
    expect(renderedComponent.current.settings).toStrictEqual(mockProjectResponse.settings);
    expect(renderedComponent.current.lgFiles.length).toBe(1);
    expect(renderedComponent.current.luFiles.length).toBe(1);
    expect(renderedComponent.current.botEnvironment).toBe(mockProjectResponse.botEnvironment);
    expect(renderedComponent.current.skills.length).toBe(0);
    // expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.schemas.sdk).toBeDefined();
    expect(renderedComponent.current.schemas.default).toBeDefined();
    expect(renderedComponent.current.schemas.diagnostics?.length).toBe(0);
    expect(navigateTo).toHaveBeenLastCalledWith(`/bot/${projectId}/dialogs/`);
    expect(result).toBe(renderedComponent.current.projectId);
  });

  it('should handle project failure if project does not exist', async () => {
    const errorObj = {
      data: 'Project does not exist in cache',
    };
    (httpClient.put as jest.Mock).mockRejectedValueOnce(errorObj);

    await act(async () => {
      renderedComponent.current.setRecentProjects([
        {
          path: '../test/empty-bot',
        },
      ]);
      await dispatcher.openProject('../test/empty-bot', 'default');
    });
    // expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.appError).toEqual(errorObj);
    expect(renderedComponent.current.recentProjects.length).toBe(0);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('should fetch recent projects', async () => {
    const recentProjects = [{ path: '../test/empty-bot1' }, { path: '../test/empty-bot2' }];
    (httpClient.get as jest.Mock).mockResolvedValue({ data: recentProjects });
    await act(async () => {
      await dispatcher.fetchRecentProjects();
    });

    expect(renderedComponent.current.recentProjects).toEqual(recentProjects);
  });

  it('should get runtime templates', async () => {
    const templates = [
      { id: 'EchoBot', index: 1, name: 'Echo Bot' },
      { id: 'EmptyBot', index: 2, name: 'Empty Bot' },
    ];
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: templates,
    });
    await act(async () => {
      await dispatcher.fetchRuntimeTemplates();
    });

    expect(renderedComponent.current.runtimeTemplates).toEqual(templates);
  });

  it('should get templates', async () => {
    const templates = [
      { id: 'EchoBot', index: 1, name: 'Echo Bot' },
      { id: 'EmptyBot', index: 2, name: 'Empty Bot' },
    ];
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: templates,
    });
    await act(async () => {
      await dispatcher.fetchTemplates();
    });

    expect(renderedComponent.current.templates).toEqual(templates);
  });

  it('should delete a project', async () => {
    (httpClient.delete as jest.Mock).mockResolvedValue({ data: {} });
    (httpClient.put as jest.Mock).mockResolvedValueOnce({
      data: mockProjectResponse,
    });
    await act(async () => {
      await dispatcher.openProject('../test/empty-bot', 'default');
      await dispatcher.deleteBot(projectId);
    });

    expect(renderedComponent.current.botName).toEqual('');
    expect(renderedComponent.current.locale).toBe('en-us');
    expect(renderedComponent.current.lgFiles.length).toBe(0);
    expect(renderedComponent.current.luFiles.length).toBe(0);
    expect(renderedComponent.current.botEnvironment).toBe('production');
    expect(renderedComponent.current.skills.length).toBe(0);
    // expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.schemas.sdk).toBeUndefined();
    expect(renderedComponent.current.schemas.default).toBeUndefined();
    expect(renderedComponent.current.schemas.diagnostics?.length).toBeUndefined();
  });

  it('should set bot status', async () => {
    await act(async () => {
      await dispatcher.setBotStatus(BotStatus.pending, projectId);
    });

    expect(renderedComponent.current.botStatus).toEqual(BotStatus.pending);
  });

  it('should save template id', async () => {
    act(() => {
      dispatcher.saveTemplateId('EchoBot');
    });

    expect(renderedComponent.current.templateId).toEqual('EchoBot');
  });

  it('should update boilerplate', async () => {
    httpClient.get as jest.Mock;
    await act(async () => {
      await dispatcher.updateBoilerplate(projectId);
    });

    expect(renderedComponent.current.announcement).toEqual('Scripts successfully updated.');
  });

  it('should get bolierplate version', async () => {
    const version = { updateRequired: true, latestVersion: '3', currentVersion: '2' };
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: version,
    });
    await act(async () => {
      await dispatcher.getBoilerplateVersion(projectId);
    });

    expect(renderedComponent.current.boilerplateVersion).toEqual(version);
  });
});
