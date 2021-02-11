// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import formatMessage from 'format-message';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title } from '../styles';

import ExternalAdapterSettings from './ExternalAdapterSettings';
import ABSChannels from './ABSChannels';

type Props = {
  projectId: string;
  scrollToSectionId?: string;
};

const AdapterSection = ({ projectId, scrollToSectionId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current && scrollToSectionId === '#runtimeSettings') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <div ref={containerRef}>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
        <ExternalAdapterSettings projectId={projectId} />
        <ABSChannels projectId={projectId} />
      </CollapsableWrapper>
    </div>
  );
};

export default AdapterSection;
