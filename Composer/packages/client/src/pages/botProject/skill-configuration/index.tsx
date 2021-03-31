// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title } from '../styles';

import { AllowedCallers } from './AllowedCallers';
import { SkillToggle } from './SkillToggle';

type Props = {
  projectId: string;
};

export const SkillConfiguration: React.FC<Props> = ({ projectId }) => {
  return (
    <CollapsableWrapper title={formatMessage('Allowed callers')} titleStyle={title}>
      <AllowedCallers projectId={projectId} />
      <SkillToggle projectId={projectId} />
    </CollapsableWrapper>
  );
};
