// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useContext } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { StoreContext } from '../../../store';

import { onboardingSettings } from './style';

export const OnboardingSettings = () => {
  const {
    actions: { onboardingSetComplete },
    state: {
      onboarding: { complete },
    },
  } = useContext(StoreContext);

  const onChange = useCallback(() => {
    onboardingSetComplete(!complete);
  }, [complete, onboardingSetComplete]);

  return (
    <div css={onboardingSettings}>
      <h1>{formatMessage('Onboarding')}</h1>
      <p>{formatMessage('Enabling Onboarding will restart the product tour.')}</p>
      <Toggle
        data-testid="onboardingToggle"
        checked={!complete}
        label={formatMessage('Onboarding')}
        offText={formatMessage('Disabled')}
        onChange={onChange}
        onText={formatMessage('Enabled')}
      />
    </div>
  );
};
