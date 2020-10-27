// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import { labelContainer, customerLabel, unknownIconStyle, titleStyle } from './styles';

type SkillHostEndPointProps = {
  projectId: string;
};

const onRenderLabel = (props: ITextFieldProps | undefined) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props?.label} </div>
      <TooltipHost content={props?.label}>
        <Icon iconName={'Unknown'} styles={unknownIconStyle(props?.required)} />
      </TooltipHost>
    </div>
  );
};

export const SkillHostEndPoint: React.FC<SkillHostEndPointProps> = (props) => {
  const { projectId } = props;
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const { skillHostEndpoint } = useRecoilValue(settingsState(projectId));
  return (
    <CollapsableWrapper title={formatMessage('Skill host endpoint')} titleStyle={titleStyle}>
      <TextField
        aria-labelledby={'SkillHostEndPoint'}
        data-testid={'SkillHostEndPointTextField'}
        label={formatMessage('Skill host endpoint url')}
        placeholder={'Enter Skill host endpoint url'}
        value={skillHostEndpoint}
        onChange={(e, value) => {
          setSettings(projectId, {
            ...settings,
            skillHostEndpoint: value,
          });
          console.log('triggered');
        }}
        onRenderLabel={onRenderLabel}
      />
    </CollapsableWrapper>
  );
};
