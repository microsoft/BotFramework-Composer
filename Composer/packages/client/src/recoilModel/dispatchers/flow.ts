/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { rateInfoState, flowCommentsVisibilityState } from '../atoms/flowState';

export const flowDispatcher = () => {
  const updateZoomRate = useRecoilCallback(({ set }: CallbackInterface) => async ({ currentRate }) => {
    set(rateInfoState, (rateInfo) => {
      return { ...rateInfo, currentRate };
    });
  });

  const toggleFlowComments = useRecoilCallback(({ set }) => () => {
    set(flowCommentsVisibilityState, (current) => !current);
  });

  return {
    updateZoomRate,
    toggleFlowComments,
  };
};
