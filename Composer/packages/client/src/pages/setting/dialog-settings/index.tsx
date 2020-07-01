// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';

import { useStoreContext } from '../../../hooks/useStoreContext';

import { hostedSettings, hostedControls, settingsEditor } from './style';

const hostControlLabels = {
  showKeys: formatMessage('Show keys'),
  productionSlot: formatMessage('In production'),
  integrationSlot: formatMessage('In test'),
  botSettings: formatMessage('Settings'),
  botSettingDescription: formatMessage(
    'Settings contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings.'
  ),
  learnMore: formatMessage('Learn more.'),
};

export const DialogSettings: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useStoreContext();
  const { botName, settings, projectId, userSettings } = state;

  const saveChangeResult = (result) => {
    try {
      const mergedResult = result;
      actions.setSettings(projectId, mergedResult);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  const handleChange = (result: any) => {
    // prevent result was undefined, it will cause error
    if (result && typeof result === 'object') {
      saveChangeResult(result);
    }
  };

  const hostedControl = () => (
    <div css={hostedControls}>
      <p>
        {hostControlLabels.botSettingDescription}
        &nbsp;
        <Link href={'https://aka.ms/bf-composer-docs-publish-bot'} target="_blank">
          {hostControlLabels.learnMore}
        </Link>
      </p>
    </div>
  );

  return botName ? (
    <div css={hostedSettings}>
      {hostedControl()}
      <div css={settingsEditor}>
        <JsonEditor editorSettings={userSettings.codeEditor} value={settings} onChange={handleChange} />
      </div>
    </div>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
