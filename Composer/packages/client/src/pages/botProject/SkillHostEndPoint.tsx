// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { Link } from 'office-ui-fabric-react/lib/components/Link';

import { dispatcherState, settingsState } from '../../recoilModel';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { colors } from '../../colors';

// -------------------- Styles -------------------- //

import { subtext, title } from './styles';
// -------------------- Styles -------------------- //

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: colors.red,
          paddingRight: 3,
        },
      },
    },
  };
};

// -------------------- SkillHostEndPoint -------------------- //

type SkillHostEndPointProps = {
  projectId: string;
};

const onRenderLabel = (props) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props.label} </div>
      <TooltipHost content={props.label}>
        <Icon iconName="Unknown" styles={unknownIconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

export const SkillHostEndPoint: React.FC<SkillHostEndPointProps> = (props) => {
  const { projectId } = props;
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const { skillHostEndpoint } = useRecoilValue(settingsState(projectId));

  return (
    <Fragment>
      <div css={title}>{formatMessage('Call skills')}</div>
      <div css={subtext}>
        {formatMessage.rich(
          'Add a skill host endpoint so your skills can reliably connect to your root bot. <a>Learn more</a>.',
          {
            a: ({ children }) => (
              <Link key="skills-settings-page" href={'https://aka.ms/composer-skills-learnmore'} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <TextField
        ariaLabel={formatMessage('Skill host endpoint url')}
        data-testid={'SkillHostEndPointTextField'}
        label={formatMessage('Skill host endpoint URL')}
        placeholder={formatMessage('Enter Skill host endpoint URL')}
        value={skillHostEndpoint}
        onChange={(e, value) => {
          setSettings(projectId, {
            ...mergedSettings,
            skillHostEndpoint: value,
          });
        }}
        onRenderLabel={onRenderLabel}
      />
    </Fragment>
  );
};
