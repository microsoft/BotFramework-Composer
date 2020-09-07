// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { userSettingsState, dispatcherState } from '../../../recoilModel';

import { link, section } from './styles';
import { SettingToggle } from './SettingToggle';
import * as images from './images';

export const ElectronSettings: React.FC<RouteComponentProps> = () => {
  const userSettings = useRecoilValue(userSettingsState);
  const { updateUserSettings } = useRecoilValue(dispatcherState);

  const onAppUpdatesChange = (key: string) => (checked: boolean) => {
    updateUserSettings({ appUpdater: { [key]: checked } });
  };

  return (
    <section css={section}>
      <h2>{formatMessage('Application Updates')}</h2>
      <SettingToggle
        checked={userSettings.appUpdater.autoDownload}
        description={formatMessage('Check for updates and install them automatically.')}
        image={images.autoUpdate}
        title={formatMessage('Auto update')}
        onToggle={onAppUpdatesChange('autoDownload')}
      />
      <SettingToggle
        checked={userSettings.appUpdater.useNightly}
        description={
          formatMessage.rich(
            'Install pre-release versions of Composer, daily, to access and test the latest features. <a>Learn more</a>.',
            {
              a: (props) => {
                <Link
                  href="https://github.com/microsoft/BotFramework-Composer-Nightlies"
                  rel="noopener noreferrer"
                  styles={link}
                  target="_blank"
                >
                  {props.children}
                </Link>;
              },
            }
          ) as any
        }
        image={images.earlyAdopters}
        title={formatMessage('Early adopters')}
        onToggle={onAppUpdatesChange('useNightly')}
      />
    </section>
  );
};
