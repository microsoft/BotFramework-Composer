// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { lazy, useCallback, useContext, useState, Suspense } from 'react';
import formatMessage from 'format-message';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';
import { NeutralColors } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../../store';
import { isElectron } from '../../../utils/electronUtil';

import { container, section } from './styles';
import { SettingToggle } from './SettingToggle';
import * as images from './images';

const ElectronSettings = lazy(() =>
  import('./electronSettings').then(module => ({ default: module.ElectronSettings }))
);

const AppSettings: React.FC<RouteComponentProps> = () => {
  const [calloutIsShown, showCallout] = useState(false);

  const {
    actions: { onboardingSetComplete, updateUserSettings },
    state: {
      onboarding: { complete },
      userSettings,
    },
  } = useContext(StoreContext);

  const onOnboardingChange = useCallback(
    (checked: boolean) => {
      // on means its not complete
      onboardingSetComplete(!checked);
      showCallout(checked);
    },
    [onboardingSetComplete]
  );

  const onCodeEditorChange = (key: string) => (checked: boolean) => {
    updateUserSettings({ codeEditor: { [key]: checked } });
  };

  const renderElectronSettings = isElectron();

  return (
    <div css={container}>
      <section css={section}>
        <h2>{formatMessage('Onboarding')}</h2>
        <SettingToggle
          id="onboardingToggle"
          title={formatMessage('Onboarding')}
          image={images.onboarding}
          description={formatMessage('Introduction of key concepts and user experience elements for Composer.')}
          checked={!complete}
          onToggle={onOnboardingChange}
        />
        <TeachingBubble
          calloutProps={{
            hidden: !calloutIsShown,
            role: 'status',
            directionalHint: DirectionalHint.rightCenter,
            isBeakVisible: false,
          }}
          target="#onboardingToggle"
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
              <FontIcon iconName="SplitObject" />
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
        <h2>{formatMessage('Property editor preferences')}</h2>
        <SettingToggle
          checked={userSettings.codeEditor.minimap}
          onToggle={onCodeEditorChange('minimap')}
          title={formatMessage('Minimap')}
          description={formatMessage(
            'A minimap gives a overview of your source code for quick navigation and code understanding.'
          )}
          image={images.minimap}
        />
        <SettingToggle
          checked={userSettings.codeEditor.lineNumbers}
          onToggle={onCodeEditorChange('lineNumbers')}
          title={formatMessage('Line numbers')}
          description={formatMessage('Enable line numbers to refer to code lines by number.')}
          image={images.lineNumbers}
        />
        <SettingToggle
          checked={userSettings.codeEditor.wordWrap}
          onToggle={onCodeEditorChange('wordWrap')}
          title={formatMessage('Sentence wrap')}
          description={formatMessage('Display lines that extends beyond the width of the editor on the next line.')}
          image={images.wordWrap}
        />
      </section>

      <Suspense fallback={<div />}>{renderElectronSettings && <ElectronSettings />}</Suspense>
    </div>
  );
};

export { AppSettings };
