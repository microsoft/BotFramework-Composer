// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';

import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import { DeleteBotButton } from './DeleteBotButton';

// -------------------- Styles -------------------- //

const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

// -------------------- BotProjectSettingsTableView -------------------- //

export const BotProjectSettingsTableView: React.FC<RouteComponentProps<{ projectId: string }>> = (props) => {
  const { projectId = '' } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;

  return (
    <div css={container}>
      {isRootBot && <SkillHostEndPoint projectId={projectId} />}
      <AppIdAndPassword projectId={projectId} />
      <ExternalService projectId={projectId} />
      <BotLanguage projectId={projectId} />
      <RuntimeSettings projectId={projectId} />
      <PublishTargets projectId={projectId} />
      {isRootBot && <DeleteBotButton projectId={projectId} />}
    </div>
  );
};

export default BotProjectSettingsTableView;
