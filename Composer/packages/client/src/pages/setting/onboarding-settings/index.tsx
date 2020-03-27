// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useContext, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';

import { StoreContext } from '../../../store';

import { onboardingSettings, onboardingTitle } from './style';

export const OnboardingSettings = () => {
  const [calloutIsShown, showCallout] = useState(false);

  const {
    actions: { onboardingSetComplete },
    state: {
      onboarding: { complete },
    },
  } = useContext(StoreContext);

  const onChange = useCallback(() => {
    onboardingSetComplete(!complete);
    showCallout(complete);
  }, [complete, onboardingSetComplete]);

  const toggleRef = useRef(null);

  return (
    <div css={onboardingSettings}>
      <h1 css={onboardingTitle}>{formatMessage('Onboarding')}</h1>
      <p>{formatMessage('Enabling Onboarding will restart the product tour.')}</p>
      <div ref={toggleRef}>
        <Toggle
          data-testid="onboardingToggle"
          checked={!complete}
          label={formatMessage('Onboarding')}
          offText={formatMessage('Disabled')}
          onChange={onChange}
          onText={formatMessage('Enabled')}
        />
        <Callout
          isBeakVisible={false}
          hidden={!calloutIsShown}
          role="status"
          aria-live="assertive"
          target={toggleRef.current}
          directionalHint={DirectionalHint.bottomLeftEdge}
        >
          <div
            css={css`
              margin: 16px;
              display: flex;
              justify-content: space-around;
              align-items: center;
            `}
          >
            <Icon
              styles={{
                root: [
                  {
                    fontSize: '24px',
                    marginRight: '8px',
                    color: '#88f',
                  },
                ],
              }}
              iconName="SplitObject"
            />
            {formatMessage('Please return to Design View to start the Onboarding tutorial.')}
          </div>
        </Callout>
      </div>
      <Link href="https://aka.ms/bfc-onboarding" target="_blank" rel="noopener noreferrer">
        {formatMessage('Learn more')}
      </Link>
    </div>
  );
};
