// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { RootBotExternalService } from './RootBotExternalService';
import { SkillBotExternalService } from './SkillBotExternalService';

// -------------------- ExternalService -------------------- //
type ExternalServiceProps = {
  projectId: string;
  hash?: string;
};

export const ExternalService: React.FC<ExternalServiceProps> = (props) => {
  const { projectId, hash = '' } = props;
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const isRootBot = rootBotProjectId === projectId;
  return isRootBot ? (
    <RootBotExternalService hash={hash} projectId={projectId} />
  ) : (
    <SkillBotExternalService hash={hash} projectId={projectId} />
  );
};
