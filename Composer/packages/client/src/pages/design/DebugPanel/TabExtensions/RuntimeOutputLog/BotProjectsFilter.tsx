// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';

import { outputsDebugPanelSelector } from '../../../../../recoilModel';
import { BotStatusIndicator } from '../../../../../components/BotRuntimeController/BotStatusIndicator';

export const BotProjectsFilter = ({ currentProjectId, onChangeProject }) => {
  const projectsData = useRecoilValue(outputsDebugPanelSelector);

  return (
    <div
      css={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: NeutralColors.gray10,
      }}
      data-testid="runtime-logs-sidebar"
    >
      {projectsData.map((projectData) => {
        return (
          <DefaultButton
            key={projectData.projectId}
            styles={{
              root: {
                padding: '5px 10px',
                width: '100%',
                border: 'none',
                textAlign: 'left',
                justifyContent: 'flex-start',
                display: 'flex',
                backgroundColor:
                  currentProjectId === projectData.projectId ? NeutralColors.gray30 : NeutralColors.gray10,
              },
              description: projectData.botName,
            }}
            onClick={() => {
              onChangeProject(projectData.projectId);
            }}
          >
            <span
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                marginRight: '15px',
                maxWidth: '185px',
              }}
            >
              {projectData.botName}
            </span>
            <BotStatusIndicator projectId={projectData.projectId} />
          </DefaultButton>
        );
      })}
    </div>
  );
};
