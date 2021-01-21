// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useRef } from 'react';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import { title } from './styles';
import { RuntimeSettings as Runtime } from './runtime-settings/RuntimeSettings';

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
    <CollapsableWrapper title={formatMessage('Custom runtime')} titleStyle={title}>
      <div ref={containerRef}>
        <Runtime projectId={projectId} />
      </div>
    </CollapsableWrapper>
  );
};
