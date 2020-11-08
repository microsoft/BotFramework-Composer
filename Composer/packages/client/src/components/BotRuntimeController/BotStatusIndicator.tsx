// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRef, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { botRuntimeErrorState, botStatusState } from '../../recoilModel';
import { getBotStatusText } from '../../utils/botRuntimeUtils';

import { ErrorCallout } from './errorCallout';
import { useBotOperations } from './useBotOperations';

const botStatusContainer = css`
  display: flex;
  align-items: center;
`;

type BotStatusIndicatorProps = {
  projectId: string;
};

export const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({ projectId }) => {
  const botStatus = useRecoilValue(botStatusState(projectId));
  const botActionRef = useRef(null);
  const botLoadErrorMsg = useRecoilValue(botRuntimeErrorState(projectId));
  const [calloutVisible, setErrorCallout] = useState(false);
  const { startSingleBot } = useBotOperations();

  function dismissErrorDialog() {
    setErrorCallout(false);
  }

  function openErrorDialog() {
    setErrorCallout(true);
  }

  const onTryStartAgain = () => {
    dismissErrorDialog();
    startSingleBot(projectId);
  };

  const botStatusText = useMemo(() => {
    return getBotStatusText(botStatus);
  }, [botStatus]);

  return (
    <div ref={botActionRef} css={botStatusContainer}>
      <span aria-live={'assertive'}>{botStatusText}</span>
      {botLoadErrorMsg?.message && (
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
      <ErrorCallout
        error={botLoadErrorMsg}
        target={botActionRef.current}
        visible={calloutVisible}
        onDismiss={dismissErrorDialog}
        onTry={onTryStartAgain}
      />
    </div>
  );
};
