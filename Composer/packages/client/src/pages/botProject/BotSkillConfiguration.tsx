// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { AllowedCallers } from './AllowedCallers';
import { SkillHostEndPoint } from './SkillHostEndPoint';

type Props = {
  projectId: string;
};

export const BotSkillConfiguration: React.FC<Props> = ({ projectId }) => {
  return (
    <React.Fragment>
      <SkillHostEndPoint projectId={projectId} />
      <AllowedCallers projectId={projectId} />
    </React.Fragment>
  );
};
