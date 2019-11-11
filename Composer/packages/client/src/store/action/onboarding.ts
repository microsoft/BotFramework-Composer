// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';
import OnboardingState from '../../utils/onboardingStorage';

import { ActionTypes } from './../../constants';

export const onboardingAddCoachMarkRef: ActionCreator = ({ dispatch }, ref) => {
  dispatch({
    type: ActionTypes.ONBOARDING_ADD_COACH_MARK_REF,
    payload: { ref },
  });
};

export const onboardingSetComplete: ActionCreator = ({ dispatch }, complete) => {
  dispatch({
    type: ActionTypes.ONBOARDING_SET_COMPLETE,
    payload: { complete },
  });
  OnboardingState.setComplete(complete);
};
