// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import { RuntimeSettings as Runtime } from './runtime-settings/RuntimeSettings';

// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

// -------------------- RuntimeSettings -------------------- //

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
