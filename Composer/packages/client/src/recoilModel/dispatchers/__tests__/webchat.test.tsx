// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { Dispatcher } from '..';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  dispatcherState,
  isWebChatPanelVisibleState,
  webChatInspectionDataState,
  webChatTrafficState,
} from '../../atoms';
import { webChatLogDispatcher } from '../webchat';

describe('web chat dispatcher', () => {
  const projectId = '1235a.2341';
  const useRecoilTestHook = () => {
    const inspectionDataState = useRecoilValue(webChatInspectionDataState(projectId));
    const trafficState = useRecoilValue(webChatTrafficState(projectId));
    const visibilityState = useRecoilValue(isWebChatPanelVisibleState);
    const currentDispatcher = useRecoilValue(dispatcherState);
    return {
      currentDispatcher,
      inspectionDataState,
      trafficState,
      visibilityState,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: webChatInspectionDataState(projectId), initialValue: undefined },
        { recoilState: webChatTrafficState(projectId), initialValue: [] },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          webChatLogDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should append a single web chat traffic item to the log', async () => {
    const trafficItem = {
      activity: {} as any,
      id: '',
      timestamp: Date.now(),
      trafficType: 'activity' as 'activity',
    };
    await act(async () => {
      await dispatcher.appendWebChatTraffic(projectId, trafficItem);
    });

    expect(renderedComponent.current.trafficState.length).toBe(1);
  });

  it('should append multiple web chat traffic items to the log', async () => {
    const trafficItem1 = {
      activity: {} as any,
      id: '',
      timestamp: Date.now(),
      trafficType: 'activity' as 'activity',
    };
    const trafficItem2 = {
      activity: {} as any,
      id: '',
      timestamp: Date.now() + 5,
      trafficType: 'activity' as 'activity',
    };
    await act(async () => {
      await dispatcher.appendWebChatTraffic(projectId, [trafficItem1, trafficItem2]);
    });

    expect(renderedComponent.current.trafficState.length).toBe(2);
  });

  it('should clear traffic from the log', async () => {
    const trafficItem = {
      activity: {} as any,
      id: '',
      timestamp: Date.now(),
      trafficType: 'activity' as 'activity',
    };
    await act(async () => {
      await dispatcher.appendWebChatTraffic(projectId, trafficItem);
    });

    expect(renderedComponent.current.trafficState.length).toBe(1);

    await act(async () => {
      await dispatcher.clearWebChatLogs(projectId);
    });

    expect(renderedComponent.current.trafficState.length).toBe(0);
  });

  it('should set inspection data state', async () => {
    const inspectionData = {
      item: {} as any,
      mode: 'request' as 'request',
    };
    await act(async () => {
      await dispatcher.setWebChatInspectionData(projectId, inspectionData);
    });

    expect(renderedComponent.current.inspectionDataState).toEqual(inspectionData);
  });

  it('should toggle web chat visibility state', async () => {
    await act(async () => {
      await dispatcher.setWebChatPanelVisibility(true);
    });

    expect(renderedComponent.current.visibilityState).toBe(true);

    await act(async () => {
      await dispatcher.setWebChatPanelVisibility(false);
    });

    expect(renderedComponent.current.visibilityState).toBe(false);
  });
});
