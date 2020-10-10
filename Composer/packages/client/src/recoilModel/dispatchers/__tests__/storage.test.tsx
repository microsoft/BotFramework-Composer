// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';

import httpClient from '../../../utils/httpUtil';
import { storageDispatcher } from '../storage';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { runtimeTemplatesState, currentProjectIdState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '../../dispatchers';

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

describe('Storage dispatcher', () => {
  const useRecoilTestHook = () => {
    const runtimeTemplates = useRecoilValue(runtimeTemplatesState);
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      runtimeTemplates,
      currentDispatcher,
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
            storageDispatcher,
          },
        },
      }
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
