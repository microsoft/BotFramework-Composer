// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, RenderHookResult, RenderResult } from '@botframework-composer/test-utils/lib/hooks';

import httpClient from '../../../utils/httpUtil';
import { storageDispatcher } from '../storage';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { runtimeTemplatesState, currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '../../dispatchers';
import { navigateTo } from '../../../utils/navigation';

const projectId = '30876.502871204648';

jest.mock('../../../utils/navigation', () => {
  return {
    navigateTo: jest.fn(),
  };
});

jest.mock('../../parsers/lgWorker', () => {
  return {
    flush: () => new Promise<void>((resolve) => resolve()),
    addProject: () => new Promise<void>((resolve) => resolve()),
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    flush: () => new Promise<void>((resolve) => resolve()),
  };
});

jest.mock('../../persistence/FilePersistence', () => {
  return jest.fn().mockImplementation(() => {
    return { flush: () => new Promise<void>((resolve) => resolve()) };
  });
});

describe('Storage dispatcher', () => {
  const useRecoilTestHook = () => {
    const runtimeTemplates = useRecoilValue(runtimeTemplatesState);
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      runtimeTemplates,
      currentDispatcher,
    };
  };

  let renderedComponent: RenderResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    (navigateTo as jest.Mock).mockReset();
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [{ recoilState: currentProjectIdState, initialValue: projectId }],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            storageDispatcher,
          },
        },
      },
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
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
});
