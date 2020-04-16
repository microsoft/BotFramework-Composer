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
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../../store';

import { container, title, description, link, section } from './styles';

export const UserSettings: React.FC<RouteComponentProps> = () => {
  const [calloutIsShown, showCallout] = useState(false);

  const {
    actions: { onboardingSetComplete, updateUserSettings },
    state: {
      onboarding: { complete },
      userSettings,
    },
  } = useContext(StoreContext);

  const onOnboardingChange = useCallback(() => {
    onboardingSetComplete(!complete);
    showCallout(complete);
  }, [complete, onboardingSetComplete]);

  const onCodeEditorChange = useCallback(
    (key: string, checked: boolean) => {
      updateUserSettings({ codeEditor: { [key]: checked } });
    },
    [userSettings.codeEditor]
  );

  return (
    <div css={container}>
      <h1 css={title}>{formatMessage('User Preferences')}</h1>
      <section css={section}>
        <h2>{formatMessage('General')}</h2>
        <Toggle
          checked={!complete}
          data-testid="onboardingToggle"
          id={'onboardingToggle'}
          label={formatMessage('Onboarding')}
          offText={formatMessage('Disabled')}
          onChange={onOnboardingChange}
          onText={formatMessage('Enabled')}
        />
        <p css={description}>
          {formatMessage('Enabling Onboarding will restart the product tour.')}
          <Link href="https://aka.ms/bfc-onboarding" rel="noopener noreferrer" styles={link} target="_blank">
            {formatMessage('Learn more')}
          </Link>
        </p>
        <TeachingBubble
          calloutProps={{
            hidden: !calloutIsShown,
            role: 'status',
            directionalHint: DirectionalHint.rightCenter,
            isBeakVisible: false,
          }}
          styles={{
            bodyContent: {
              padding: '0px',
            },
            body: {
              margin: '0px',
            },
          }}
          target={'#onboardingToggle'}
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
      </section>

      <section css={section}>
        <h2>{formatMessage('Code Editor')}</h2>
        <Toggle
          checked={userSettings.codeEditor.lineNumbers}
          label={formatMessage('Line numbers')}
          offText={formatMessage('Off')}
          onChange={(_e, checked) => onCodeEditorChange('lineNumbers', !!checked)}
          onText={formatMessage('On')}
        />
        <Toggle
          checked={userSettings.codeEditor.wordWrap}
          label={formatMessage('Word wrap')}
          offText={formatMessage('Off')}
          onChange={(_e, checked) => onCodeEditorChange('wordWrap', !!checked)}
          onText={formatMessage('On')}
        />
        <Toggle
          checked={userSettings.codeEditor.minimap}
          label={formatMessage('Minimap')}
          offText={formatMessage('Off')}
          onChange={(_e, checked) => onCodeEditorChange('minimap', !!checked)}
          onText={formatMessage('On')}
        />
      </section>
    </div>
  );
};
