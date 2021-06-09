// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useCallback } from 'react';
import { ConversationActivityTrafficItem } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';
import { Resizable } from 're-resizable';
import { NeutralColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  inspectedBotStateIndexState,
  rootBotProjectIdSelector,
  botStateInspectionDataState,
} from '../../../../../recoilModel';

const inspectorPane = css`
  display: flex;
  flex-flow: column nowrap;
  padding: 8px 16px;
  width: 100%;
`;

const inspectorPaneToolbar = css`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const inspectorPaneContent = css`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

type BotStateInspectorPaneProps = {
  botStateTraffic: ConversationActivityTrafficItem[];
};

export const BotStateInspectorPane: React.FC<BotStateInspectorPaneProps> = (props) => {
  const { botStateTraffic = [] } = props;
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const inspectedBotState = useRecoilValue(botStateInspectionDataState(currentProjectId ?? ''));
  const inspectedBotStateIndex = useRecoilValue(inspectedBotStateIndexState(currentProjectId ?? ''));
  const { setBotStateInspectionData, setInspectedBotStateIndex } = useRecoilValue(dispatcherState);

  const prevButtonIsDisabled = useMemo(() => {
    return !!(inspectedBotStateIndex === undefined || !botStateTraffic.length || inspectedBotStateIndex === 0);
  }, [botStateTraffic, inspectedBotStateIndex]);

  const nextButtonIsDisabled = useMemo(() => {
    return !!(
      inspectedBotStateIndex === undefined ||
      !botStateTraffic.length ||
      inspectedBotStateIndex >= botStateTraffic.length - 1
    );
  }, [botStateTraffic, inspectedBotStateIndex]);

  const inspectPrevBotState = useCallback(() => {
    if (currentProjectId && inspectedBotStateIndex !== undefined) {
      const newIndex = inspectedBotStateIndex - 1;
      setInspectedBotStateIndex(currentProjectId, newIndex);
      setBotStateInspectionData(currentProjectId, botStateTraffic[newIndex].activity);
    }
  }, [botStateTraffic, currentProjectId, inspectedBotStateIndex]);

  const inspectNextBotState = useCallback(() => {
    if (currentProjectId && inspectedBotStateIndex !== undefined) {
      const newIndex = inspectedBotStateIndex + 1;
      setInspectedBotStateIndex(currentProjectId, newIndex);
      setBotStateInspectionData(currentProjectId, botStateTraffic[newIndex].activity);
    }
  }, [botStateTraffic, currentProjectId, inspectedBotStateIndex]);

  const showDiff = useCallback(() => {
    console.log('TODO: Show diff');
  }, []);

  const copyBotState = useCallback(() => {
    console.log('TODO: Copy bot state');
  }, []);

  return (
    <Resizable
      css={{
        height: '100%',
        width: '50%',
        borderLeft: `1px solid ${NeutralColors.gray30}`,
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
      defaultSize={{
        height: '100%',
        width: '50%',
      }}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
    >
      <div css={inspectorPane}>
        <div css={inspectorPaneToolbar}>
          <select>
            <option>Something</option>
          </select>
          <button disabled={prevButtonIsDisabled} onClick={inspectPrevBotState}>
            {'<'}
          </button>
          <button disabled={nextButtonIsDisabled} onClick={inspectNextBotState}>
            {'>'}
          </button>
          <button onClick={showDiff}>Show diff</button>
          <button onClick={copyBotState}>Copy</button>
        </div>
        <div css={inspectorPaneContent}>{JSON.stringify(inspectedBotState, null, 2)}</div>
      </div>
    </Resizable>
  );
};
