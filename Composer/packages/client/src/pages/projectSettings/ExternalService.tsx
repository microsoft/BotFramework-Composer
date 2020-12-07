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
  scrollToSectionId?: string;
};

export const ExternalService: React.FC<ExternalServiceProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const isRootBot = rootBotProjectId === projectId;
  return isRootBot ? (
    <RootBotExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
  ) : (
    <SkillBotExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
  );
};
