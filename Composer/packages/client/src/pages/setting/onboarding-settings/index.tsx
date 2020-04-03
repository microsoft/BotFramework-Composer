// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useContext, useState } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';
import { NeutralColors } from '@uifabric/fluent-theme';

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

  return (
    <div css={onboardingSettings}>
      <h1 css={onboardingTitle}>{formatMessage('Onboarding')}</h1>
      <p>{formatMessage('Enabling Onboarding will restart the product tour.')}</p>
      <Toggle
        id={'onboardingToggle'}
        data-testid="onboardingToggle"
        checked={!complete}
        onChange={onChange}
        label={formatMessage('Onboarding')}
        offText={formatMessage('Disabled')}
        onText={formatMessage('Enabled')}
      />
      <TeachingBubble
        calloutProps={{
          hidden: !calloutIsShown,
          role: 'status',
          directionalHint: DirectionalHint.rightCenter,
          isBeakVisible: false,
        }}
        target={'#onboardingToggle'}
        styles={{
          bodyContent: {
            padding: '0px',
          },
          body: {
            margin: '0px',
          },
        }}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          <div
            css={css`
              font-size: 24px;
              background: ${NeutralColors.gray20};
              color: black;
              padding: 4px;
            `}
          >
            <FontIcon iconName={'SplitObject'} />
          </div>
          <div
            css={css`
              padding-left: 8px;
            `}
          >
            {formatMessage('Please return to Design View to start the Onboarding tutorial.')}
          </div>
        </div>
      </TeachingBubble>
      <Link href="https://aka.ms/bfc-onboarding" target="_blank" rel="noopener noreferrer">
        {formatMessage('Learn more')}
      </Link>
    </div>
  );
};
