// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRef, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';

import { botRuntimeErrorState, botStatusState } from '../../recoilModel';
import { BotStatus, BotStatusesCopy } from '../../constants';

import { ErrorCallout } from './errorCallout';
import { useBotOperations } from './useBotOperations';

const botStatusContainer = css`
  display: flex;
  align-items: center;
`;

type BotStatusIndicatorProps = {
  projectId: string;
  setGlobalErrorCalloutVisibility: (isVisible: boolean) => void;
};

export const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({
  projectId,
  setGlobalErrorCalloutVisibility,
}) => {
  const botStatus = useRecoilValue(botStatusState(projectId));
  const botActionRef = useRef(null);
  const botRuntimeErrorMsg = useRecoilValue(botRuntimeErrorState(projectId));
  const { startSingleBot } = useBotOperations();
  const [botStatusStyle, setBotStatusStyle] = useState({});
  const [isCurrentCalloutVisible, setCurrentCalloutVisibility] = useState(false);

  function dismissErrorDialog() {
    setCurrentCalloutVisibility(false);
    setGlobalErrorCalloutVisibility(false);
  }

  function openErrorDialog() {
    setCurrentCalloutVisibility(true);
    setGlobalErrorCalloutVisibility(true);
  }

  const onTryStartAgain = () => {
    dismissErrorDialog();
    startSingleBot(projectId);
  };

  const botStatusText = useMemo(() => {
    if (botStatus === BotStatus.connected) {
      setBotStatusStyle({
        color: SharedColors.green10,
      });
    } else if (botStatus === BotStatus.failed) {
      setBotStatusStyle({
        color: SharedColors.red10,
      });
    } else {
      setBotStatusStyle({
        color: SharedColors.gray20,
      });
    }
    return BotStatusesCopy[botStatus] ?? BotStatusesCopy.inactive;
  }, [botStatus]);

  return (
    <div ref={botActionRef} css={botStatusContainer}>
      <span aria-live={'assertive'} style={botStatusStyle}>
        {botStatusText}
      </span>
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
      <ErrorCallout
        error={botRuntimeErrorMsg}
        target={botActionRef.current}
        visible={isCurrentCalloutVisible}
        onDismiss={dismissErrorDialog}
        onTry={onTryStartAgain}
      />
    </div>
  );
};
