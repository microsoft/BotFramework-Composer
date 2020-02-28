// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useContext } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { StoreContext } from '../../../store';

import { onboardingSettings, onboardingTitle } from './style';

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
      <div css={onboardingTitle}>{formatMessage('Onboarding')}</div>
      <p>{formatMessage('Enabling Onboarding will restart the product tour.')}</p>
      <Toggle
        data-testid="onboardingToggle"
        checked={!complete}
        label={formatMessage('Onboarding')}
        offText={formatMessage('Disabled')}
        onChange={onChange}
        onText={formatMessage('Enabled')}
      />
      <Link href="https://aka.ms/bfc-onboarding" target="_blank" rel="noopener noreferrer">
        {formatMessage('Learn more')}
      </Link>
    </div>
  );
};
