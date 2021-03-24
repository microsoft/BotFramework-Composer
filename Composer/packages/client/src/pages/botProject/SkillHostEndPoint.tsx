// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

import { title } from './styles';
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
          color: SharedColors.red10,
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
    <CollapsableWrapper title={formatMessage('Skill host endpoint')} titleStyle={title}>
      <TextField
        ariaLabel={formatMessage('Skill host endpoint url')}
        data-testid={'SkillHostEndPointTextField'}
        label={formatMessage('Skill host endpoint url')}
        placeholder={formatMessage('Enter Skill host endpoint url')}
        value={skillHostEndpoint}
        onChange={(e, value) => {
          setSettings(projectId, {
            ...mergedSettings,
            skillHostEndpoint: value,
          });
        }}
        onRenderLabel={onRenderLabel}
      />
    </CollapsableWrapper>
  );
};
