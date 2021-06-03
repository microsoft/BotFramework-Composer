// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { BotStatus } from '../../constants';
import { botStatusState, dispatcherState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

type OpenWebChatButtonProps = {
  projectId: string;
  isRootBot: boolean;
};

export const OpenWebChatButton: React.FC<OpenWebChatButtonProps> = ({ projectId, isRootBot }) => {
  const { setWebChatPanelVisibility: toggleWebChatPanel } = useRecoilValue(dispatcherState);
  const currentBotStatus = useRecoilValue(botStatusState(projectId));

  if (!isRootBot) {
    return null;
  }

  const onOpenWebChatClick = () => {
    toggleWebChatPanel(true);
    TelemetryClient.track('WebChatPaneOpened');
  };

  return currentBotStatus === BotStatus.connected ? (
    <ActionButton
      iconProps={{
        iconName: 'OfficeChat',
      }}
      styles={{ root: { height: '20px' } }}
      onClick={onOpenWebChatClick}
    >
      {formatMessage('Open Web Chat')}
    </ActionButton>
  ) : null;
};
