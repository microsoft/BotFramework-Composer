// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { title, subtitle, subtext } from '../styles';

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
      <div css={subtitle}>
        {formatMessage(
          'Expand the reach of your bot by adding connections. Connections are added per bot (typically to the root bot, if your project contains multiple bots), as well as per publishing profile. Select a publishing profile to add and enable connections. '
        )}
        <Link href="" target="blank">
          {formatMessage('Learn more.')}
        </Link>
      </div>
      <Stack>
        <div css={title}>{formatMessage('Azure connections')}</div>
        <div css={subtitle}>
          {formatMessage('Connect your bot to Microsoft Teams and WebChat, or enable DirectLine Speech.')}
        </div>
        <ABSChannels projectId={projectId} />
      </Stack>
      <Stack>
        <div css={title}>{formatMessage('External connections')}</div>
        <div css={subtext}>
          {formatMessage('Find and install more external services to your bot project in ')}
          <Link href="" target="blank">
            {formatMessage('package manager. ')}
          </Link>
          {formatMessage(' For further guidance, see documentation for ')}
          <Link href="" target="blank">
            {formatMessage('adding external connections.')}
          </Link>
        </div>
        <ExternalAdapterSettings projectId={projectId} />
      </Stack>
    </div>
  );
};

export default AdapterSection;
