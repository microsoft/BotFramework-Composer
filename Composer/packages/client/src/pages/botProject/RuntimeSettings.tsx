// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useEffect, useRef } from 'react';
import { jsx } from '@emotion/react';
import formatMessage from 'format-message';

import { SettingTitle } from './shared/SettingTitle';
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
    <Fragment>
      <SettingTitle>{formatMessage('Custom runtime')}</SettingTitle>
      <div ref={containerRef}>
        <Runtime projectId={projectId} />
      </div>
    </Fragment>
  );
};
