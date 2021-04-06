// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle } from '../styles';

import ExternalAdapterSettings from './ExternalAdapterSettings';
import ABSChannels from './ABSChannels';

type Props = {
  projectId: string;
  scrollToSectionId?: string;
};

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
        <Stack
          tokens={{
            padding: '6px 0 6px 0',
          }}
        >
          <div css={title}>{formatMessage('Azure connections')}</div>
          <div css={subtitle}>
            {formatMessage.rich(
              'Connect your bot to Microsoft Teams and WebChat, or enable speech. Connections are added per bot (typically to the root bot, if your project contains multiple bots), as well as per publishing profile. Select a publishing profile to view, add, and enable Azure connections. <a>Learn more</a>',
              {
                a: ({ children }) => (
                  <Link href="http://" target="_blank">
                    {children}
                  </Link>
                ),
              }
            )}
          </div>
          <ABSChannels projectId={projectId} />
        </Stack>
        <Stack>
          <div css={title}>{formatMessage('External connections')}</div>
          <div css={subtitle}>
            {formatMessage.rich(
              'Find and install more external services in the package manager. For further guidance, see the documentation for <a>adding external connections.</a>',
              {
                a: ({ children }) => (
                  <Link href="http://" target="_blank">
                    {children}
                  </Link>
                ),
              }
            )}
          </div>
          <ExternalAdapterSettings projectId={projectId} />
        </Stack>
      </CollapsableWrapper>
    </div>
  );
};

export default AdapterSection;
