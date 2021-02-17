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

import { isElectron } from '../../../utils/electronUtil';
import { onboardingState, userSettingsState, dispatcherState } from '../../../recoilModel';

import { container, section } from './styles';
import { SettingToggle } from './SettingToggle';
import { SettingDropdown } from './SettingDropdown';
// import { FontSettings } from './fontSettings';
import * as images from './images';
import { PreviewFeatureToggle } from './PreviewFeatureToggle';

const ElectronSettings = lazy(() =>
  import('./electronSettings').then((module) => ({ default: module.ElectronSettings }))
);

const AppSettings: React.FC<RouteComponentProps> = () => {
  const [calloutIsShown, showCallout] = useState(false);

  const { onboardingSetComplete, updateUserSettings } = useRecoilValue(dispatcherState);
  const userSettings = useRecoilValue(userSettingsState);
  const { complete } = useRecoilValue(onboardingState);
  const onOnboardingChange = useCallback(
    (checked: boolean) => {
      // on means its not complete
      onboardingSetComplete(!checked);
      showCallout(checked);
    },
    [onboardingSetComplete]
  );

  const onCodeEditorChange = (key: string) => (value: boolean | Record<string, string | number>) => {
    updateUserSettings({ codeEditor: { [key]: value } });
  };

  const onLocaleChange = (appLocale: string) => {
    updateUserSettings({ appLocale });
  };

  const handleDataCollectionChange = (allowDataCollection: boolean) => {
    updateUserSettings({
      telemetry: {
        allowDataCollection,
      },
    });
  };

  const renderElectronSettings = isElectron();

  const languageOptions = [
    { key: 'en-US', text: 'English (US)' },
    { key: 'cs', text: 'Čeština‎ Czech' }, //Czech
    { key: 'de', text: 'Deutsch‎' }, //German
    { key: 'es', text: 'Español‎' }, //Spanish
    { key: 'fr', text: 'Français‎' }, //French
    { key: 'hu', text: 'Magyar‎' }, //Hungarian
    { key: 'it', text: 'Italiano‎' }, //Italian
    { key: 'ja', text: '日本語‎' }, //Japanese
    { key: 'ko', text: '한국어‎' }, //Korean
    { key: 'nl', text: 'Nederlands‎' }, //Dutch (Netherlands qw)
    { key: 'pl', text: 'Polski‎' }, //Polish
    { key: 'pt-BR', text: 'Português (Brasil)‎' }, //Portuguese (Brazil)
    { key: 'pt-PT', text: 'Português (Portugal)‎' }, //Portuguese (Portugal)
    { key: 'ru', text: 'Русский‎' }, //Russian
    { key: 'sv', text: 'Svenska‎' }, //Swedish
    { key: 'tr', text: 'Türkçe‎' }, //Turkish
    { key: 'zh-Hans', text: '中文(简体)‎' }, //Chinese Simplified)
    { key: 'zh-Hant', text: '中文(繁體)' }, //Chinese (Traditional)
  ];

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

  return (
    <div css={container}>
      <section css={section}>
        <section css={section}>
          <h2>{formatMessage('Application Language settings')}</h2>
          <SettingDropdown
            description={formatMessage('This is the language used for Composer’s user interface.')}
            options={languageOptions}
            selected={userSettings.appLocale}
            title={formatMessage('Application language')}
            onChange={onLocaleChange}
          />
        </section>
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
        {/* <FontSettings
          description={formatMessage('Font settings used in the text editors.')}
          fontFamily={userSettings.codeEditor.fontSettings.fontFamily}
          fontSize={userSettings.codeEditor.fontSettings.fontSize}
          fontWeight={userSettings.codeEditor.fontSettings.fontWeight}
          image={images.wordWrap}
          title={formatMessage('Font settings')}
          onChange={onCodeEditorChange('fontSettings')}
        /> */}
      </section>
      <section css={section}>
        <h2>{formatMessage('Application Updates')}</h2>
        <Suspense fallback={<div />}>{renderElectronSettings && <ElectronSettings />}</Suspense>
        <PreviewFeatureToggle />
      </section>
      {renderElectronSettings && (
        <section css={section}>
          <h2>{formatMessage('Data Collection')}</h2>
          <SettingToggle
            checked={!!userSettings.telemetry.allowDataCollection}
            description={formatMessage(
              'Composer includes a telemetry feature that collects usage information. It is important that the Composer team understands how the tool is being used so that it can be improved.'
            )}
            id="dataCollectionToggle"
            title={formatMessage('Data collection')}
            onToggle={handleDataCollectionChange}
          />
        </section>
      )}
    </div>
  );
};

export { AppSettings };
