// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { botRuntimeErrorState, dispatcherState } from '../../recoilModel';

type BotErrorViewerProps = {
  projectId: string;
};

export const BotErrorViewer: React.FC<BotErrorViewerProps> = ({ projectId }) => {
  const { setActiveTabInDebugPanel, setDebugPanelExpansion } = useRecoilValue(dispatcherState);
  const botRuntimeErrorMsg = useRecoilValue(botRuntimeErrorState(projectId));

  function openErrorDialog() {
    setActiveTabInDebugPanel('RuntimeLogs');
    setDebugPanelExpansion(true);
  }

  return (
    <Fragment>
      {botRuntimeErrorMsg?.message && (
        <ActionButton
          styles={{
            root: {
              color: '#0078d4',
              height: '20px',
            },
          }}
          onClick={() => {
            openErrorDialog();
          }}
        >
          <span>{formatMessage('See Details')}</span>
        </ActionButton>
      )}
    </Fragment>
  );
};
