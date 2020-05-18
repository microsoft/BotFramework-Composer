// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../../store';

import { link, section } from './styles';
import { SettingToggle } from './SettingToggle';
import * as images from './images';

export const ElectronSettings: React.FC<RouteComponentProps> = () => {
  const {
    actions: { updateUserSettings },
    state: { userSettings },
  } = useContext(StoreContext);

  const onAppUpdatesChange = (key: string) => (checked: boolean) => {
    updateUserSettings({ appUpdater: { [key]: checked } });
  };

  return (
    <section css={section}>
      <h2>{formatMessage('Application Updates')}</h2>
      <SettingToggle
        checked={userSettings.appUpdater.autoDownload}
        onToggle={onAppUpdatesChange('autoDownload')}
        title={formatMessage('Auto update')}
        description={formatMessage('Check for updates and installs them automatically.')}
        image={images.autoUpdate}
      />
      <SettingToggle
        checked={userSettings.appUpdater.useNightly}
        onToggle={onAppUpdatesChange('useNightly')}
        title={formatMessage('Early adopters')}
        description={
          formatMessage.rich(
            'Install pre-release versions of Composer, daily, to access and test the latest features. <a>Learn more</a>.',
            {
              a: (props) => {
                <Link
                  href="https://github.com/microsoft/BotFramework-Composer-Nightlies"
                  target="_blank"
                  rel="noopener noreferrer"
                  styles={link}
                >
                  {props.children}
                </Link>;
              },
            }
          ) as any
        }
        image={images.earlyAdopters}
      />
    </section>
  );
};
