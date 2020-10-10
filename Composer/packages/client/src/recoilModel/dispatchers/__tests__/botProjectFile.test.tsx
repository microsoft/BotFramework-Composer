// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, useRecoilValue, selectorFamily, useRecoilState } from 'recoil';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';
import noop from 'lodash/noop';

import { botProjectFileDispatcher } from '../botProjectFile';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  botDisplayNameState,
  botErrorState,
  botNameIdentifierState,
  botProjectFileState,
  botProjectIdsState,
  currentProjectIdState,
  locationState,
  projectMetaDataState,
} from '../../atoms';
import { dispatcherState } from '../../DispatcherWrapper';
import { Dispatcher } from '..';

jest.mock('../../../utils/httpUtil');
const rootBotProjectId = '2345.32324';
const testSkillId = '123.1sd23';

describe('Bot Project File dispatcher', () => {
  const skillsDataSelector = selectorFamily({
    key: 'skillsDataSelector-botProjectFile',
    get: (skillId: string) => noop,
    set: (skillId: string) => ({ set }, stateUpdater: any) => {
      const { botNameIdentifier, location } = stateUpdater;
      set(botNameIdentifierState(skillId), botNameIdentifier);
      set(locationState(skillId), location);
    },
  });

  const botStatesSelector = selector({
    key: 'botStatesSelector',
    get: ({ get }) => {
      const botProjectIds = get(botProjectIdsState);
      const botProjectData: { [projectName: string]: { botDisplayName: string; botError: any; location: string } } = {};
      botProjectIds.map((projectId) => {
        const botDisplayName = get(botDisplayNameState(projectId));
        const botNameIdentifier = get(botNameIdentifierState(projectId));
        const botError = get(botErrorState(projectId));
        const location = get(locationState(projectId));
        if (botNameIdentifier) {
          botProjectData[botNameIdentifier] = {
            botDisplayName,
            location,
            botError,
          };
        }
      });
      return botProjectData;
    },
  });

  const useRecoilTestHook = () => {
    const botName = useRecoilValue(botDisplayNameState(rootBotProjectId));
    const botProjectFile = useRecoilValue(botProjectFileState(rootBotProjectId));
    const currentDispatcher = useRecoilValue(dispatcherState);
    const botStates = useRecoilValue(botStatesSelector);
    const [skillsData, setSkillsData] = useRecoilState(skillsDataSelector(testSkillId));

    return {
      botName,
      currentDispatcher,
      botProjectFile,
      botStates,
      skillsData,
      setSkillsData,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;
  beforeEach(() => {
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [
          { recoilState: currentProjectIdState, initialValue: rootBotProjectId },
          {
            recoilState: botProjectFileState(rootBotProjectId),
            initialValue: {
              content: {
                $schema: '',
                name: 'TesterBot',
                workspace: 'file:///Users/tester/Desktop/LoadedBotProject/TesterBot',
                skills: {},
              },
            },
          },
          {
            recoilState: projectMetaDataState(rootBotProjectId),
            initialValue: {
              isRootBot: true,
            },
          },
          { recoilState: botProjectIdsState, initialValue: [rootBotProjectId] },
        ],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            botProjectFileDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should add a local skill to bot project file', async () => {
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: 'Users/tester/Desktop/LoadedBotProject/Todo-Skill',
        botNameIdentifier: 'todoSkill',
      });
    });

    await act(async () => {
      dispatcher.addLocalSkillToBotProjectFile(testSkillId);
    });

    expect(renderedComponent.current.botProjectFile.content.skills.todoSkill.workspace).toBe(
      'file:///Users/tester/Desktop/LoadedBotProject/Todo-Skill'
    );
    expect(renderedComponent.current.botProjectFile.content.skills.todoSkill.remote).toBeFalsy();
  });

  it('should add a remote skill to bot project file', async () => {
    const manifestUrl = 'https://test-dev.azurewebsites.net/manifests/test-2-1-preview-1-manifest.json';
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: manifestUrl,
        botNameIdentifier: 'oneNoteSkill',
      });
    });

    await act(async () => {
      dispatcher.addRemoteSkillToBotProjectFile(testSkillId, manifestUrl, 'remote');
    });

    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.manifest).toBe(manifestUrl);
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.workspace).toBeUndefined();
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.endpointName).toBe('remote');
  });

  it('should remove a skill from the bot project file', async () => {
    const manifestUrl = 'https://test-dev.azurewebsites.net/manifests/test-2-1-preview-1-manifest.json';
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: manifestUrl,
        botNameIdentifier: 'oneNoteSkill',
      });
    });

    await act(async () => {
      dispatcher.addRemoteSkillToBotProjectFile(testSkillId, manifestUrl, 'remote');
    });
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.manifest).toBe(manifestUrl);

    await act(async () => {
      dispatcher.removeSkillFromBotProjectFile(testSkillId);
    });
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill).toBeUndefined();
  });
});
