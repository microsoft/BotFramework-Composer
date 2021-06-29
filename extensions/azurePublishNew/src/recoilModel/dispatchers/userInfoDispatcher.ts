// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { userInfoState } from '../atoms/resourceConfigurationState';
import { UserInfo } from '../../types';

export const userInfoDispatcher = () => {
  const setUserInfo = useRecoilCallback(({ set }: CallbackInterface) => (userInfo: UserInfo) => {
    set(userInfoState, userInfo);
  });

  return {
    setUserInfo,
  };
};
