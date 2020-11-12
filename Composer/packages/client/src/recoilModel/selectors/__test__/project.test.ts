// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { act, RenderHookResult } from '@botframework-composer/test-utils/lib/hooks';
import noop from 'lodash/noop';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { botErrorState, botProjectFileState, botProjectIdsState, projectMetaDataState } from '../../atoms';
import { botsForFilePersistenceSelector, rootBotProjectIdSelector } from '../project';

const projectIds = ['123-a', '234-bc', '567-de'];

const projectDataSelector = selectorFamily({
  key: 'project-data-selector',
  get: (projectId: string) => noop,
  set: (projectId: string) => ({ set }, stateUpdater: any) => {
    const { metadata, botError } = stateUpdater;
    if (metadata) {
      set(projectMetaDataState(projectId), metadata);
    }

    if (botError) {
      set(botErrorState(projectId), location);
    }
  },
});

const useRecoilTestHook = () => {
  const [botProjectIds, setBotProjectIds] = useRecoilState(botProjectIdsState);
  const botsForFilePersistence = useRecoilValue(botsForFilePersistenceSelector);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rootBotDataSelector = useSetRecoilState(projectDataSelector(projectIds[0]));
  const firstSkillDataSelector = useSetRecoilState(projectDataSelector(projectIds[1]));
  const secondSkillDataSelector = useSetRecoilState(projectDataSelector(projectIds[2]));
  const [rootBotProjectFile, setBotProjectFile] = useRecoilState(botProjectFileState(projectIds[0]));

  return {
    botProjectIds,
    botsForFilePersistence,
    rootBotProjectId,
    rootBotProjectFile,
    setters: {
      secondSkillDataSelector,
      firstSkillDataSelector,
      rootBotDataSelector,
      setBotProjectFile,
      setBotProjectIds,
    },
  };
};

let renderedComponent;

beforeEach(() => {
  const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
    useRecoilTestHook,
    {
      states: [],
    }
  );
  renderedComponent = rendered.result;
});

it('should get the correct root bot project id', async () => {
  await act(async () => {
    renderedComponent.current.setters.setBotProjectIds(['123-a', '234-bc', '567-de']);
    renderedComponent.current.setters.rootBotDataSelector({
      metadata: {
        isRemote: false,
        isRootBot: true,
      },
    });
    renderedComponent.current.setters.firstSkillDataSelector({
      metadata: {
        isRemote: false,
        isRootBot: false,
      },
    });
    renderedComponent.current.setters.secondSkillDataSelector({
      metadata: {
        isRemote: true,
        isRootBot: false,
      },
    });
  });
  expect(renderedComponent.current.rootBotProjectId).toBe(projectIds[0]);
});

it('should get local bots without error for file persistence', async () => {
  await act(async () => {
    renderedComponent.current.setters.setBotProjectIds(['123-a', '234-bc', '567-de']);
    renderedComponent.current.setters.rootBotDataSelector({
      metadata: {
        isRemote: false,
        isRootBot: true,
      },
    });
    renderedComponent.current.setters.firstSkillDataSelector({
      metadata: {
        isRemote: false,
        isRootBot: false,
      },
      botError: {
        ex: 'Error loading the bot',
      },
    });
    renderedComponent.current.setters.secondSkillDataSelector({
      metadata: {
        isRemote: true,
        isRootBot: false,
      },
    });
  });
  expect(renderedComponent.current.botsForFilePersistence).toEqual([projectIds[0]]);
});
