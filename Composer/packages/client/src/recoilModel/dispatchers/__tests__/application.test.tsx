// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState, useRecoilValue } from 'recoil';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';
// eslint-disable-next-line lodash/import-scope
import debounce from 'lodash/debounce';

import { applicationDispatcher } from '../application';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  appUpdateState,
  announcementState,
  applicationErrorState,
  creationFlowStatusState,
  onboardingState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { AppUpdaterStatus, CreationFlowStatus } from '../../../constants';
import { StateError } from '../../types';

jest.mock('lodash/debounce');
(debounce as any).mockImplementation((fn) => fn);

describe('<Editor />', () => {
  const useRecoilTestHook = () => {
    const [appUpdater, setAppUpdater] = useRecoilState(appUpdateState);
    const dispatcher = useRecoilValue(dispatcherState);
    const announcement = useRecoilValue(announcementState);
    const applicationError = useRecoilValue(applicationErrorState);
    const creationFlowState = useRecoilValue(creationFlowStatusState);
    const onboarding = useRecoilValue(onboardingState);

    return {
      appUpdater,
      setAppUpdater,
      dispatcher,
      announcement,
      applicationError,
      creationFlowState,
      onboarding,
    };
  };
  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeAll(() => {});

  beforeEach(() => {
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            applicationDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.dispatcher;
  });

  it('should set app updater state and version', async () => {
    await act(async () => {
      dispatcher.setAppUpdateStatus(AppUpdaterStatus.IDLE, '1.2');
    });

    expect(renderedComponent.current.appUpdater.version).toBeUndefined();
    await act(async () => {
      dispatcher.setAppUpdateStatus(AppUpdaterStatus.UPDATE_AVAILABLE, '1.2');
    });
    expect(renderedComponent.current.appUpdater.version).toBe('1.2');
  });

  it('should set app updater showing', () => {
    act(() => {
      dispatcher.setAppUpdateShowing(true);
    });
    expect(renderedComponent.current.appUpdater.showing).toBe(true);
  });

  it('should set app updater error', () => {
    const error = {
      message: 'An error occured with updating composer',
    };
    act(() => {
      dispatcher.setAppUpdateError(error);
    });
    expect(renderedComponent.current.appUpdater.error).toBe(error);
  });

  it('should set app updater progress', () => {
    act(() => {
      dispatcher.setAppUpdateProgress(20, 100);
    });
    expect(renderedComponent.current.appUpdater.progressPercent).toBe(20);
    act(() => {
      dispatcher.setAppUpdateProgress(40, 200);
    });
    expect(renderedComponent.current.appUpdater.progressPercent).toBe(40);
  });

  it('should set announcement', () => {
    act(() => {
      dispatcher.setMessage('Test1');
      dispatcher.setMessage('Test2');
      dispatcher.setMessage('Test3');
      dispatcher.setMessage('Test4');
      dispatcher.setMessage('Test5');
      dispatcher.setMessage('Test6');
      dispatcher.setMessage('Test7');
    });

    expect(renderedComponent.current.announcement).toBe('Test7');
  });

  it('should set announcement', () => {
    act(() => {
      dispatcher.setMessage('Test1');
      dispatcher.setMessage('Test2');
      dispatcher.setMessage('Test3');
      dispatcher.setMessage('Test4');
      dispatcher.setMessage('Test5');
      dispatcher.setMessage('Test6');
      dispatcher.setMessage('Test7');
    });

    expect(renderedComponent.current.announcement).toBe('Test7');
  });

  it('should set application error', () => {
    const error: StateError = { status: 401, message: 'Invalid credentials', summary: 'Pass the correct OAuth token' };
    act(() => {
      dispatcher.setApplicationLevelError(error);
    });

    expect(renderedComponent.current.applicationError).toBe(error);
  });

  it('should set creation flow status', () => {
    act(() => {
      dispatcher.setCreationFlowStatus(CreationFlowStatus.NEW);
    });
    expect(renderedComponent.current.creationFlowState).toBe(CreationFlowStatus.NEW);

    act(() => {
      dispatcher.setCreationFlowStatus(CreationFlowStatus.OPEN);
    });
    expect(renderedComponent.current.creationFlowState).toBe(CreationFlowStatus.OPEN);

    act(() => {
      dispatcher.setCreationFlowStatus(CreationFlowStatus.NEW_FROM_SCRATCH);
    });
    expect(renderedComponent.current.creationFlowState).toBe(CreationFlowStatus.NEW_FROM_SCRATCH);

    act(() => {
      dispatcher.setCreationFlowStatus(CreationFlowStatus.SAVEAS);
    });
    expect(renderedComponent.current.creationFlowState).toBe(CreationFlowStatus.SAVEAS);
  });

  it('should set onboarding status to complete', () => {
    act(() => {
      dispatcher.onboardingSetComplete(true);
    });
    expect(renderedComponent.current.onboarding.complete).toBe(true);
    act(() => {
      dispatcher.onboardingSetComplete(false);
    });
    expect(renderedComponent.current.onboarding.complete).toBe(false);
  });

  it('should set onboarding object', () => {
    act(() => {
      dispatcher.onboardingAddCoachMarkRef({
        home: { element: 'homepageElement' },
        editor: { element: 'editorElement' },
      });
    });
    expect(renderedComponent.current.onboarding.coachMarkRefs).toEqual({
      home: { element: 'homepageElement' },
      editor: { element: 'editorElement' },
    });
  });
});
