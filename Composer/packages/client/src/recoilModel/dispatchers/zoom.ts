/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { rateInfoState } from '../atoms/zoomState';

export const zoomDispatcher = () => {
  const updateZoomRate = useRecoilCallback(({ set }: CallbackInterface) => async ({ currentRate }) => {
    set(rateInfoState, (rateInfo) => {
      return { ...rateInfo, currentRate };
    });
  });
  return {
    updateZoomRate,
  };
};
