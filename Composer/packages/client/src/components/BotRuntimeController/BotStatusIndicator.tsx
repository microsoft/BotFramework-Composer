// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SharedColors } from '@uifabric/fluent-theme';

import { botStatusState } from '../../recoilModel';
import { BotStatus, BotStatusesCopy } from '../../constants';

type BotStatusIndicatorProps = {
  projectId: string;
};

export const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({ projectId }) => {
  const botStatus = useRecoilValue(botStatusState(projectId));
  const botActionRef = useRef(null);

  const [botStatusStyle, setBotStatusStyle] = useState({});

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
    <div
      ref={botActionRef}
      css={{
        display: 'flex',
        alignItems: 'center',
        marginRight: '5px',
      }}
    >
      <span aria-live={'assertive'} style={botStatusStyle}>
        {botStatusText}
      </span>
    </div>
  );
};
