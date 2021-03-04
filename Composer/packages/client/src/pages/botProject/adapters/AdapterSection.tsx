// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle, sectionHeader } from '../styles';

import ExternalAdapterSettings from './ExternalAdapterSettings';
import ABSChannels from './ABSChannels';

type Props = {
  projectId: string;
  scrollToSectionId?: string;
};

const renderSectionHeader = (name: string, tooltip?: string) => (
  <div css={sectionHeader}>
    {name}
    {tooltip != null && (
      <TooltipHost content={tooltip} styles={{ root: { paddingLeft: '4px' } }}>
        <Icon iconName="Unknown" />
      </TooltipHost>
    )}
  </div>
);

const AdapterSection = ({ projectId, scrollToSectionId }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current && scrollToSectionId === '#connections') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <div ref={containerRef}>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
        <div css={subtitle}>{formatMessage('Connect your bot to other messaging services.')}</div>
        {renderSectionHeader(formatMessage('Azure Bot Service channels'), '(description of ABS channels)')}
        <ABSChannels projectId={projectId} />
        {renderSectionHeader(formatMessage('External service adapters'), '(description of external adapters)')}
        <ExternalAdapterSettings projectId={projectId} />
      </CollapsableWrapper>
    </div>
  );
};

export default AdapterSection;
