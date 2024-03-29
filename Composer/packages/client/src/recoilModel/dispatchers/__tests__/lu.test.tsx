// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { LuIntentSection, LuFile } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { act, RenderResult } from '@botframework-composer/test-utils/lib/hooks';
import { luUtil } from '@bfc/indexers';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '..';
import { luDispatcher } from '../lu';
import { luFilesSelectorFamily } from '../../selectors';

const luFeatures = {};

jest.mock('../../parsers/luWorker', () => {
  return {
    parse: (id: string, content, luFeatures) => ({ id, content, luFeatures }),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    addIntent: require('@bfc/indexers/lib/utils/luUtil').addIntent,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    addIntents: require('@bfc/indexers/lib/utils/luUtil').addIntents,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    updateIntent: require('@bfc/indexers/lib/utils/luUtil').updateIntent,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    removeIntent: require('@bfc/indexers/lib/utils/luUtil').removeIntent,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    removeIntents: require('@bfc/indexers/lib/utils/luUtil').removeIntents,
  };
});
const projectId = '123ansd.23432';
const file1 = {
  id: 'common.en-us',
  content: `\r\n# Hello\r\n-hi`,
};

const luFiles = [luUtil.parse(file1.id, file1.content, luFeatures, [])] as LuFile[];

const getLuIntent = (Name, Body): LuIntentSection =>
  ({
    Name,
    Body,
  }) as LuIntentSection;

describe('Lu dispatcher', () => {
  const useRecoilTestHook = () => {
    const [luFiles, setLuFiles] = useRecoilState(luFilesSelectorFamily(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      luFiles,
      setLuFiles,
      currentDispatcher,
    };
  };

  let renderedComponent: RenderResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: luFilesSelectorFamily(projectId), initialValue: luFiles },
        { recoilState: currentProjectIdState, initialValue: projectId },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          luDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should update a lu file', async () => {
    await act(async () => {
      await dispatcher.updateLuFile({
        id: 'common.en-us',
        projectId,
        content: `\r\n# New\r\n-new`,
      });
    });

    expect(renderedComponent.current.luFiles[0].content).toMatch(/# New/);
  });

  it('should update a lu intent', async () => {
    await act(async () => {
      await dispatcher.updateLuIntent({
        id: luFiles[0].id,
        intentName: 'Hello',
        intent: getLuIntent('Hello', '-IntentValue'),
        projectId,
      });
    });

    expect(renderedComponent.current.luFiles[0].content).toMatch(/-IntentValue/);
  });

  it('should create a lu Intent', async () => {
    await act(async () => {
      await dispatcher.createLuIntent({
        id: luFiles[0].id,
        intent: getLuIntent('New', '-IntentValue'),
        projectId,
      });
    });
    expect(renderedComponent.current.luFiles[0].content).toMatch(/-IntentValue/);
  });

  it('should remove a lu intent', async () => {
    await act(async () => {
      await dispatcher.removeLuIntent({
        id: luFiles[0].id,
        intentName: 'Hello',
        projectId,
      });
    });

    expect(renderedComponent.current.luFiles[0].content).toBe(``);
  });
});
