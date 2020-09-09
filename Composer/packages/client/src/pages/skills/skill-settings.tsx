// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogSetting } from '@bfc/shared';

import { FormFieldAlignHorizontalBotSettings } from './styles';

export interface ISkillFormProps {
  botId?: string;
  skillHostEndpoint?: string;
  botPassword?: string;
  setSettings: (projectId: string, settings: DialogSetting) => Promise<void>;
  projectId: string;
  botName: string;
  settings: DialogSetting;
}

const SkillSettings: React.FC<ISkillFormProps> = (props) => {
  const [skillSettings, setSkillSettings] = useState({
    botId: props.botId,
    skillHostEndpoint: props.skillHostEndpoint,
    botPassword: props.botPassword,
  });
  useEffect(() => {
    setSkillSettings({
      botId: props.botId,
      skillHostEndpoint: props.skillHostEndpoint,
      botPassword: props.botPassword,
    });
  }, [props.botId, props.botPassword, props.skillHostEndpoint]);

  const handleFieldChange = (event) => {
    const localSettings = {
      ...skillSettings,
      [event.target.id]: event.target.value,
    };

    // auto fill `botId` with `MicrosoftAppId`
    if (event.target.id === 'MicrosoftAppId') {
      localSettings.botId = event.target.value;
    }

    setSkillSettings({ ...localSettings });
    props.setSettings(props.projectId, { ...props.settings, ...localSettings });
  };

  return (
    <div css={FormFieldAlignHorizontalBotSettings}>
      <div style={{ marginLeft: '20px' }}>
        <TextField
          underlined
          aria-labelledby={'microsoftAppId'}
          data-testid="SkillBotId"
          description={formatMessage('The Microsoft App Id that will be calling the skill.')}
          id={'MicrosoftAppId'}
          label={formatMessage('Microsoft App Id')}
          style={{ maxWidth: '300px' }}
          value={skillSettings.botId}
          onChange={handleFieldChange}
        />
      </div>
      <div style={{ marginLeft: '20px' }}>
        <TextField
          underlined
          aria-labelledby={'microsoftAppPassword'}
          data-testid="SkillBotPassword"
          description={formatMessage('The Microsoft App Password that will be calling the skill.')}
          id={'MicrosoftAppPassword'}
          label={formatMessage('Microsoft App Password')}
          style={{ maxWidth: '300px' }}
          value={skillSettings.botPassword}
          onChange={handleFieldChange}
        />
      </div>
      <div style={{ marginLeft: '20px' }}>
        <TextField
          underlined
          aria-labelledby={'skillHostEndpoint'}
          data-testid="SkillHostEndpoint"
          description={formatMessage('The callback url for the skill host.')}
          id={'skillHostEndpoint'}
          label={formatMessage('Skill Host Endpoint')}
          style={{ width: '400px' }}
          value={skillSettings.skillHostEndpoint}
          onChange={handleFieldChange}
        />
      </div>
    </div>
  );
};

export default SkillSettings;
