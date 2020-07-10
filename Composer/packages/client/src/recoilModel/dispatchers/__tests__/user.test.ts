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

jest.mock('../../../utils/auth', () => {
  return {
    getUserTokenFromCache: jest.fn(),
    loginPopup: jest.fn(),
  };
});
jest.mock('jwt-decode');

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
      it('spits out an error', async () => {
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
    });
  });

  it('updateUserSettings', async () => {});

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
