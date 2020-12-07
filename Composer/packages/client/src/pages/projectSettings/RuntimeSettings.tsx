// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useRef } from 'react';
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
  scrollToSectionId?: string;
};

export const RuntimeSettings: React.FC<RuntimeSettingsProps> = (props) => {
  const { projectId, scrollToSectionId } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scrollToSectionId === '#runtimeSettings') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <CollapsableWrapper title={formatMessage('Custom runtime')} titleStyle={titleStyle}>
      <div ref={containerRef}>
        <Runtime projectId={projectId} />
      </div>
    </CollapsableWrapper>
  );
};
