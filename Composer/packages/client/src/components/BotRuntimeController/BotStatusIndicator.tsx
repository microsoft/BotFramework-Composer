// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { botStatusState } from '../../recoilModel';
import { BotStatus, BotStatusesCopy } from '../../constants';
import { colors } from '../../colors';

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
        color: colors.green,
      });
    } else if (botStatus === BotStatus.failed) {
      setBotStatusStyle({
        color: colors.red,
      });
    } else {
      setBotStatusStyle({
        color: colors.gray(20),
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
