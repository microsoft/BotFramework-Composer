// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { lazy, useCallback, useState, Suspense } from 'react';
import formatMessage from 'format-message';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';
import { NeutralColors } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { FeatureFlag, FeatureFlagKey } from '@bfc/shared';

import { isElectron } from '../../../utils/electronUtil';
import { onboardingState, userSettingsState, dispatcherState, featureFlagsState } from '../../../recoilModel';

import { container, featureFlagGroupContainer, section } from './styles';
import { SettingToggle } from './SettingToggle';
import { SettingDropdown } from './SettingDropdown';
import * as images from './images';
import { FeatureFlagCheckBox } from './FeatureFlagCheckBox';

const ElectronSettings = lazy(() =>
  import('./electronSettings').then((module) => ({ default: module.ElectronSettings }))
);

const AppSettings: React.FC<RouteComponentProps> = () => {
  const [calloutIsShown, showCallout] = useState(false);
  const [featureFlagVisible, showFeatureFlag] = useState(false);

  const { onboardingSetComplete, updateUserSettings, toggleFeatureFlag } = useRecoilValue(dispatcherState);
  const userSettings = useRecoilValue(userSettingsState);
  const { complete } = useRecoilValue(onboardingState);
  const featureFlags = useRecoilValue(featureFlagsState);
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

  const onLocaleChange = (appLocale: string) => {
    updateUserSettings({ appLocale });
  };

  const renderElectronSettings = isElectron();

  const languageOptions = [{ key: 'en-US', text: formatMessage('English (US)') }];
  if (process.env.NODE_ENV !== 'production') {
    languageOptions.push({
      key: 'en-US-pseudo',
      text: formatMessage('Pseudo'),
    });
    languageOptions.push({
      key: 'en-US-DoesNotExist',
      text: formatMessage('Does Not Exist'),
    });
  }

  const renderFeatureFlagOptions = () => {
    const result: React.ReactNode[] = [];
    console.log(featureFlags);
    Object.keys(featureFlags).forEach((key: string) => {
      const featureFlag: FeatureFlag = featureFlags[key];
      if (!featureFlag.isHidden) {
        result.push(
          <FeatureFlagCheckBox
            key={key}
            description={featureFlag.description}
            enabled={featureFlag.enabled}
            featureFlagKey={key as FeatureFlagKey}
            featureFlagName={featureFlag.displayName}
            toggleFeatureFlag={toggleFeatureFlag}
          />
        );
      }
    });
    return <div css={featureFlagGroupContainer}>{result}</div>;
  };

  return (
    <div css={container}>
      <section css={section}>
        <h2>{formatMessage('Onboarding')}</h2>
        <SettingToggle
          checked={!complete}
          description={formatMessage('Introduction of key concepts and user experience elements for Composer.')}
          id="onboardingToggle"
          image={images.onboarding}
          title={formatMessage('Onboarding')}
          onToggle={onOnboardingChange}
        />
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
          target="#onboardingToggle"
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
          description={formatMessage(
            'A minimap gives an overview of your source code for quick navigation and code understanding.'
          )}
          image={images.minimap}
          title={formatMessage('Minimap')}
          onToggle={onCodeEditorChange('minimap')}
        />
        <SettingToggle
          checked={userSettings.codeEditor.lineNumbers}
          description={formatMessage('Enable line numbers to refer to code lines by number.')}
          image={images.lineNumbers}
          title={formatMessage('Line numbers')}
          onToggle={onCodeEditorChange('lineNumbers')}
        />
        <SettingToggle
          checked={userSettings.codeEditor.wordWrap}
          description={formatMessage('Display lines that extends beyond the width of the editor on the next line.')}
          image={images.wordWrap}
          title={formatMessage('Sentence wrap')}
          onToggle={onCodeEditorChange('wordWrap')}
        />
      </section>
      <section css={section}>
        <h2>{formatMessage('Application Language')}</h2>
        <SettingDropdown
          description={formatMessage('This is the language used for Composer’s user interface.')}
          image={images.language}
          options={languageOptions}
          selected={userSettings.appLocale}
          title={formatMessage('Application language')}
          onChange={onLocaleChange}
        />
      </section>
      <section css={section}>
        <h2>{formatMessage('Application Updates')}</h2>
        <SettingToggle
          hideToggle
          checked={featureFlagVisible}
          description={formatMessage('Toggle the visibility of individual, preview, features in Composer.')}
          image={images.previewFeatures}
          title={formatMessage('Preview features')}
          onToggle={(checked: boolean) => {
            showFeatureFlag(checked);
          }}
        />
        {renderFeatureFlagOptions()}
      </section>
      <Suspense fallback={<div />}>{renderElectronSettings && <ElectronSettings />}</Suspense>
    </div>
  );
};

export { AppSettings };
