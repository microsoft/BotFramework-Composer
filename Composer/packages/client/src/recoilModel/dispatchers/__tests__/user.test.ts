// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, RenderResult } from '@botframework-composer/test-utils/lib/hooks';

import { userDispatcher } from '../user';
import { UserSettingsPayload } from '../../types';
import { DEFAULT_USER_SETTINGS } from '../../utils';
import { getDefaultFontSettings } from '../../utils/fontUtil';
import { userSettingsState, dispatcherState } from '../../atoms/appState';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { Dispatcher } from '..';

const realDate = Date.now;

jest.mock('../../../utils/auth', () => {
  return {
    getUserTokenFromCache: jest.fn(),
    loginPopup: jest.fn(),
  };
});
jest.mock('jwt-decode');

beforeAll(() => {
  jest.useFakeTimers();
  global.Date.now = jest.fn(() => 10000000);
});

afterAll(() => {
  global.Date.now = realDate;
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('user dispatcher', () => {
  const useRecoilTestHook = () => {
    const userSettings = useRecoilValue(userSettingsState);

    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      userSettings,
      currentDispatcher,
    };
  };

  let renderedComponent: RenderResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    process.env.COMPOSER_REQUIRE_AUTH = 'true'; // needs to be a string

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        {
          recoilState: userSettingsState,
          initialValue: DEFAULT_USER_SETTINGS,
        },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          userDispatcher,
        },
      },
    });

    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('updateUserSettings', async () => {
    await act(async () => {
      dispatcher.updateUserSettings({
        appUpdater: { autoDownload: true }, // updates one object deep
        dialogNavWidth: 555, // to test non-object updating\
        nonsense: 'foo', // should not appear in results
      } as Partial<UserSettingsPayload>); // cheat the type so we can pass a noncompliant argument without complaint
    });
    expect(renderedComponent.current.userSettings).toEqual({
      appUpdater: {
        autoDownload: true,
        useNightly: false,
      },
      codeEditor: {
        lineNumbers: false,
        wordWrap: false,
        minimap: false,
        fontSettings: getDefaultFontSettings(),
      },
      propertyEditorWidth: 400,
      dialogNavWidth: 555,
      appLocale: 'en-US',
      telemetry: {},
    });
  });
});
