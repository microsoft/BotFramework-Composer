// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { BotStatus } from './../../constants';
import { TooltipHost } from 'office-ui-fabric-react';

interface IEmulatorOpenButtonProps {
  botEndpoint: string;
  botStatus: BotStatus;
  hidden: boolean;
  onClick: () => void;
}

export const EmulatorOpenButton: React.FC<IEmulatorOpenButtonProps> = props => {
  const { onClick, botStatus, hidden, botEndpoint } = props;
  const connected = botStatus === BotStatus.connected;

  if (hidden || !connected) return null;

  return (
    <TooltipHost content={botEndpoint}>
      <ActionButton
        iconProps={{
          iconName: 'OpenInNewTab',
        }}
        onClick={onClick}
      >
        {formatMessage('Test in Emulator')}
      </ActionButton>
    </TooltipHost>
  );
};
