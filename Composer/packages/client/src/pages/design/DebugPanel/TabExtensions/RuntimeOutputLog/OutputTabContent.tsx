// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Split } from '@geoffcox/react-splitter';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { renderThinSplitter } from '../../../../../components/Split/ThinSplitter';
import {
  botProjectIdsState,
  botProjectSpaceLoadedState,
  dispatcherState,
  rootBotProjectIdSelector,
} from '../../../../../recoilModel';
import { DebugPanelTabHeaderProps } from '../types';
import httpClient from '../../../../../utils/httpUtil';
import { checkIfDotnetVersionMissing, missingDotnetVersionError } from '../../../../../utils/runtimeErrors';
import { BotStartError } from '../../../../../recoilModel/types';
import { Text } from '../../../../../constants';

import { RuntimeOutputLog } from './RuntimeOutputLog';
import { BotProjectsFilter } from './BotProjectsFilter';

const genericErrorMessage = () => {
  return {
    message: 'Runtime Log',
    summary: formatMessage('Error occurred trying to fetch runtime standard output'),
  };
};

export const OutputsTabContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const [currentProjectId, setProjectId] = useState(rootBotId ?? '');
  const runtimeTrafficChannel = useRef<Record<string, WebSocket> | null>(null);
  const projectIds = useRecoilValue(botProjectIdsState);
  const { setRuntimeStandardOutputData, setApplicationLevelError } = useRecoilValue(dispatcherState);
  const botProjectSolutionLoaded = useRecoilValue(botProjectSpaceLoadedState);

  useEffect(() => {
    const setupLogConnection = async () => {
      projectIds.forEach(async (projectId) => {
        try {
          const runtimeStreamUrl = await httpClient.get(`/publish/runtimeLogUrl/${projectId}`);

          const socket = new WebSocket(runtimeStreamUrl.data);

          if (socket) {
            socket.onmessage = (event) => {
              const data: { standardError: string; standardOutput: string } = JSON.parse(event.data);

              let standardError: BotStartError | null = null;
              if (data.standardError) {
                const isDotnetError = checkIfDotnetVersionMissing({
                  message: data.standardError ?? '',
                });

                if (isDotnetError) {
                  standardError = {
                    title: Text.DOTNETFAILURE,
                    ...missingDotnetVersionError,
                  };
                } else {
                  standardError = {
                    title: Text.BOTRUNTIMEERROR,
                    message: data.standardError,
                  };
                }
              }

              setRuntimeStandardOutputData(projectId, {
                standardError,
                standardOutput: data.standardOutput,
              });
            };
            runtimeTrafficChannel.current = {
              ...runtimeTrafficChannel.current,
              [projectId]: socket,
            };
          }
        } catch (ex) {
          setApplicationLevelError(genericErrorMessage());
        }
      });
    };

    if (!runtimeTrafficChannel.current && botProjectSolutionLoaded) {
      setupLogConnection();
    }

    return () => {
      if (runtimeTrafficChannel.current) {
        for (const projectId in runtimeTrafficChannel.current) {
          runtimeTrafficChannel.current[projectId].close();
        }
      }
      runtimeTrafficChannel.current = null;
    };
  }, [botProjectSolutionLoaded]);

  return (
    <div
      css={{
        height: '100%',
        display: isActive ? 'block' : 'none',
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

        <RuntimeOutputLog projectId={currentProjectId} />
      </Split>
    </div>
  );
};
