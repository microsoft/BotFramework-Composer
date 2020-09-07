// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';
import jwtDecode from 'jwt-decode';

import { userDispatcher } from '../user';
import { DEFAULT_USER_SETTINGS } from '../../utils';
import { userSettingsState, currentUserState, CurrentUser } from '../../atoms/appState';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { dispatcherState } from '../../DispatcherWrapper';
import { getUserTokenFromCache, loginPopup } from '../../../utils/auth';

const realDate = Date.now;

jest.mock('../../../utils/auth', () => {
  return {
    getUserTokenFromCache: jest.fn(),
    loginPopup: jest.fn(),
  };
});
jest.mock('jwt-decode');
jest.useFakeTimers();

beforeAll(() => {
  global.Date.now = jest.fn(() => 10000000);
});

afterAll(() => {
  global.Date.now = realDate;
});

const mockGetUserToken = getUserTokenFromCache as jest.Mock;
const mockLoginPopup = loginPopup as jest.Mock;
const mockJwtDecode = jwtDecode as jest.Mock;

describe('user dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    process.env.COMPOSER_REQUIRE_AUTH = 'true'; // needs to be a string

    const useRecoilTestHook = () => {
      const userSettings = useRecoilValue(userSettingsState);
      const currentUser = useRecoilValue(currentUserState);

      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        userSettings,
        currentUser,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        {
          recoilState: userSettingsState,
          initialValue: DEFAULT_USER_SETTINGS,
        },
        { recoilState: currentUserState, initialValue: {} as CurrentUser },
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

  describe('loginUser', () => {
    it('without COMPOSER_REQUIRE_AUTH, does nothing', async () => {
      process.env.COMPOSER_REQUIRE_AUTH = undefined;
      expect(mockGetUserToken).not.toHaveBeenCalled();
      expect(mockLoginPopup).not.toHaveBeenCalled();
    });

    it('without a token', async () => {
      await act(async () => {
        mockGetUserToken.mockReturnValueOnce(false);
        mockLoginPopup.mockReturnValueOnce(false);
        dispatcher.loginUser();
      });
      expect(renderedComponent.current.currentUser).toEqual({
        token: null,
        sessionExpired: false,
      });
    });

    describe('with a token', () => {
      mockGetUserToken.mockImplementation(() => 'token');
      it("spits out an error if it can't decode", async () => {
        jest.spyOn(console, 'error');
        mockJwtDecode.mockImplementationOnce(() => {
          throw new Error();
        });
        await act(async () => {
          dispatcher.loginUser();
        });
        expect(console.error).toHaveBeenCalled();
        expect(renderedComponent.current.currentUser).toEqual({
          token: 'token',
          email: undefined,
          name: undefined,
          expiration: 0,
          sessionExpired: false,
        });
      });

      it('sets values given a decodable token', async () => {
        mockJwtDecode.mockImplementationOnce(() => {
          return {
            exp: 12345,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn': 'email',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'name',
          };
        });
        await act(async () => {
          dispatcher.loginUser();
        });
        expect(renderedComponent.current.currentUser).toEqual({
          token: 'token',
          email: 'email',
          name: 'name',
          expiration: 12345000,
          sessionExpired: false,
        });
        // 12345 is the expiration time in seconds, *1000 = 12345000
        // 10000000 is the mock time we set
        // 2045000 = 12345000 - 10000000 - (1000 * 60 * 5)
        expect(setTimeout).toHaveBeenCalledWith(expect.anything(), 2045000);
      });
    });
  });

  it('updateUserSettings', async () => {
    await act(async () => {
      dispatcher.updateUserSettings({
        appUpdater: { autoDownload: true }, // updates one object deep
        dialogNavWidth: 555, // to test non-object updating
        nonsense: 'foo', // should not appear in results
      });
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
      },
      propertyEditorWidth: 400,
      dialogNavWidth: 555,
    });
  });

  describe('setUserToken', () => {
    it('with a token', async () => {
      await act(async () => {
        dispatcher.setUserToken({ token: '12345' });
      });
      expect(renderedComponent.current.currentUser.token).toEqual('12345');
      expect(renderedComponent.current.currentUser.sessionExpired).toEqual(false);
    });
    it('with no token', async () => {
      await act(async () => {
        dispatcher.setUserToken({});
      });
      expect(renderedComponent.current.currentUser.token).toEqual(null);
      expect(renderedComponent.current.currentUser.sessionExpired).toEqual(false);
    });
    it('with no argument', async () => {
      await act(async () => {
        dispatcher.setUserToken();
      });
      expect(renderedComponent.current.currentUser.token).toEqual(null);
      expect(renderedComponent.current.currentUser.sessionExpired).toEqual(false);
    });
  });

  it('setUserSessionExpired', async () => {
    await act(async () => {
      dispatcher.setUserSessionExpired(true);
    });
    expect(renderedComponent.current.currentUser.sessionExpired).toBe(true);
  });
});
