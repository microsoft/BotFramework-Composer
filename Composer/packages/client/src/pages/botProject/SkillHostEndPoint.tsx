// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState } from 'react';
import { jsx } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Link } from '@fluentui/react/lib/components/Link';
import { TextField } from '@bfc/ui-shared';

import { dispatcherState, settingsState } from '../../recoilModel';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { customFieldLabel } from '../../styles';

import { subtext } from './styles';
import { SettingTitle } from './shared/SettingTitle';

// -------------------- SkillHostEndPoint -------------------- //

type SkillHostEndPointProps = {
  projectId: string;
};

export const SkillHostEndPoint: React.FC<SkillHostEndPointProps> = (props) => {
  const { projectId } = props;
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const { skillHostEndpoint } = useRecoilValue(settingsState(projectId));
  const [endpointUrl, setEndpointUrl] = useState(skillHostEndpoint);

  const handleChange = (e, value) => {
    setEndpointUrl(value);
  };

  const handleBlur = () => {
    setSettings(projectId, {
      ...mergedSettings,
      skillHostEndpoint: endpointUrl,
    });
  };

  return (
    <Fragment>
      <SettingTitle>{formatMessage('Call skills')}</SettingTitle>
      <div css={subtext}>
        {formatMessage.rich(
          'Add a skill host endpoint so your skills can reliably connect to your root bot. <a>Learn more</a>.',
          {
            a: ({ children }) => (
              <Link
                key="skills-settings-page"
                aria-label={formatMessage('Learn more about skills')}
                href={'https://aka.ms/composer-skills-learnmore'}
                target="_blank"
              >
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <TextField
        data-testid={'SkillHostEndPointTextField'}
        label={formatMessage('Skill host endpoint URL')}
        placeholder={formatMessage('Enter Skill host endpoint URL')}
        styles={customFieldLabel}
        tooltip={formatMessage('Skill host endpoint URL')}
        value={endpointUrl}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </Fragment>
  );
};
