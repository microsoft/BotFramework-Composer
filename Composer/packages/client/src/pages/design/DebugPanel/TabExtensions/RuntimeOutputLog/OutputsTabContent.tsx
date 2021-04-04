// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Split } from '@geoffcox/react-splitter';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { renderThinSplitter } from '../../../../../components/Split/ThinSplitter';
import { rootBotProjectIdSelector } from '../../../../../recoilModel';
import { DebugPanelTabHeaderProps } from '../types';

import { BotProjectsFilter } from './BotProjectsFilter';
import { RuntimeLogs } from './RuntimeLogs';

export const RuntimeOutputLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const [currentProjectId, setProjectId] = useState(rootBotId ?? '');
  return (
    <div
      css={{
        height: '100%',
        display: !isActive ? 'none' : 'block',
        overflow: 'auto',
      }}
    >
      <Split
        resetOnDoubleClick
        initialPrimarySize="200px"
        minPrimarySize="250px"
        minSecondarySize="600px"
        renderSplitter={renderThinSplitter}
        splitterSize="5px"
      >
        <BotProjectsFilter currentProjectId={currentProjectId} onChangeProject={setProjectId} />
        <RuntimeLogs projectId={currentProjectId} />
      </Split>
    </div>
  );
};
