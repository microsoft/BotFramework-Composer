// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { LuIntentSection, LuFile } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';
import { luUtil } from '@bfc/indexers';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { luFilesState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { luDispatcher } from '../lu';

jest.mock('../../parsers/luWorker', () => {
  return {
    parse: (id, content) => ({ id, content }),
    addIntent: require('@bfc/indexers/lib/utils/luUtil').addIntent,
    addIntents: require('@bfc/indexers/lib/utils/luUtil').addIntents,
    updateIntent: require('@bfc/indexers/lib/utils/luUtil').updateIntent,
    removeIntent: require('@bfc/indexers/lib/utils/luUtil').removeIntent,
    removeIntents: require('@bfc/indexers/lib/utils/luUtil').removeIntents,
  };
});

const file1 = {
  id: 'common.en-us',
  content: `\r\n# Hello\r\n-hi`,
};

const luFiles = [luUtil.parse(file1.id, file1.content)] as LuFile[];

const getLuIntent = (Name, Body): LuIntentSection =>
  ({
    Name,
    Body,
  } as LuIntentSection);

describe('Lu dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const [luFiles, setLuFiles] = useRecoilState(luFilesState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        luFiles,
        setLuFiles,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: luFilesState, initialValue: luFiles }],
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
        projectId: 'test',
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
      });
    });

    expect(renderedComponent.current.luFiles[0].content).toMatch(/-IntentValue/);
  });

  it('should create a lu Intent', async () => {
    await act(async () => {
      await dispatcher.createLuIntent({
        id: luFiles[0].id,
        intent: getLuIntent('New', '-IntentValue'),
        projectId: '',
      });
    });
    expect(renderedComponent.current.luFiles[0].content).toMatch(/-IntentValue/);
  });

  it('should remove a lu intent', async () => {
    await act(async () => {
      await dispatcher.removeLuIntent({
        id: luFiles[0].id,
        intentName: 'Hello',
        projectId: '',
      });
    });

    expect(renderedComponent.current.luFiles[0].content).toBe(``);
  });
});
