// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';

import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import { DeleteBotButton } from './DeleteBotButton';
import { container } from './styles';

type BotProjectSettingsTableViewProps = {
  projectId?: string;
  hasSkills: boolean;
} & RouteComponentProps<{}>;

export const BotProjectSettingsTableView: React.FC<BotProjectSettingsTableViewProps> = (props) => {
  const { projectId = '', hasSkills = false } = props;
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;

  return (
    <div css={container}>
      {isRootBot && <SkillHostEndPoint projectId={projectId} />}
      <AppIdAndPassword projectId={projectId} required={hasSkills} />
      <ExternalService projectId={projectId} />
      <BotLanguage projectId={projectId} />
      <RuntimeSettings projectId={projectId} />
      <PublishTargets projectId={projectId} />
      <DeleteBotButton projectId={projectId} />
    </div>
  );
};

export default BotProjectSettingsTableView;
