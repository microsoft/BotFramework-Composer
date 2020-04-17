// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, Fragment } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { FormFieldAlignHorizontalBotSettings } from './styles';

export interface ISkillFormProps {
  botId?: string;
  skillHostEndpoint?: string;
  onChange: (botId: string, skillHostEndpoint: string) => void;
}

const SkillSettings: React.FC<ISkillFormProps> = props => {
  const [skillSettings, setSkillSettings] = useState({
    botId: props.botId,
    skillHostEndpoint: props.skillHostEndpoint,
  });
  useEffect(() => {
    setSkillSettings({
      botId: props.botId,
      skillHostEndpoint: props.skillHostEndpoint,
    });
  }, [props.botId, props.skillHostEndpoint]);

  const handleFieldChange = event => {
    setSkillSettings({
      ...skillSettings,
      [event.target.id]: event.target.text,
    });
  };

  return (
    <div css={FormFieldAlignHorizontalBotSettings}>
      <div style={{ marginLeft: '20px' }}>
        <TextField
          style={{ maxWidth: '300px' }}
          aria-labelledby={'botId'}
          id={'botId'}
          underlined
          label={formatMessage('Microsoft App Id')}
          description={formatMessage('The Microsoft App Id that will be calling the skill.')}
          value={skillSettings.botId}
          onChange={handleFieldChange}
          data-testid="SkillBotId"
        />
      </div>
      <div style={{ marginLeft: '50px' }}>
        <TextField
          style={{ width: '400px' }}
          aria-labelledby={'skillHostEndpoint'}
          underlined
          id={'skillHostEndpoint'}
          description={formatMessage('The callback url for the skill host.')}
          label={formatMessage('Skill Host Endpoint')}
          value={skillSettings.skillHostEndpoint}
          onChange={handleFieldChange}
          data-testid="SkillHostEndpoint"
        />
      </div>
    </div>
  );
};

export default SkillSettings;
