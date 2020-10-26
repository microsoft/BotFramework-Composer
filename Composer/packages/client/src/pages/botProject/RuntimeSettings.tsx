// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import { RuntimeSettings as Runtime } from './runtime-settings/RuntimeSettings';
import { titleStyle } from './styles';
type RuntimeSettingsProps = {
  projectId: string;
};

export const RuntimeSettings: React.FC<RuntimeSettingsProps> = (props) => {
  const { projectId } = props;
  return (
    <CollapsableWrapper title={formatMessage('Custom runtime')} titleStyle={titleStyle}>
      <Runtime projectId={projectId} />
    </CollapsableWrapper>
  );
};
