// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useContext } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../../store';

import { description, link, section } from './styles';

export const ElectronSettings: React.FC<RouteComponentProps> = () => {
  const {
    actions: { updateUserSettings },
    state: { userSettings },
  } = useContext(StoreContext);

  const onAppUpdatesChange = useCallback(
    (key: string, checked: boolean) => {
      updateUserSettings({ appUpdater: { [key]: checked } });
    },
    [userSettings.appUpdater]
  );

  return (
    <section css={section}>
      <h2>{formatMessage('Application Updates')}</h2>
      <Toggle
        checked={userSettings.appUpdater.autoDownload}
        onChange={(_e, checked) => onAppUpdatesChange('autoDownload', !!checked)}
        label={formatMessage('Automatically download and install updates')}
        offText={formatMessage('Off')}
        onText={formatMessage('On')}
      />
      <Toggle
        checked={userSettings.appUpdater.useNightly}
        onChange={(_e, checked) => onAppUpdatesChange('useNightly', !!checked)}
        label={formatMessage('Use nightly builds')}
        offText={formatMessage('Off')}
        onText={formatMessage('On')}
      />
      <p css={description}>
        {formatMessage('Nightly builds of Composer contain the latest features but may be unstable.')}
        <Link
          href="https://github.com/microsoft/BotFramework-Composer-Nightlies"
          target="_blank"
          rel="noopener noreferrer"
          styles={link}
        >
          {formatMessage('Learn more')}
        </Link>
      </p>
    </section>
  );
};
