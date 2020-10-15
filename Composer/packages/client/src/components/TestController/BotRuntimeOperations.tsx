// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IPublishConfig } from '@bfc/shared';

import { botStatusState } from '../../recoilModel';
import { BotStatus } from '../../constants';
import {
  botBuildRequiredSelector,
  botRuntimeOperationsSelector,
  buildEssentialsSelector,
} from '../../recoilModel/selectors/botRuntimeOperations';

interface BotRuntimeOperationsProps {
  projectId: string;
  displayName: string;
}

const icon: IButtonStyles = {
  root: {
    color: `${SharedColors.cyanBlue20}`,
    marginRight: '12px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
    width: '20px',
  },
};

export const BotRuntimeOperations: React.FC<BotRuntimeOperationsProps> = ({ projectId, displayName }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botBuildRequired = useRecoilValue(botBuildRequiredSelector(projectId));
  const { configuration: startBotConfig } = useRecoilValue(buildEssentialsSelector(projectId));
  const botRuntimeOperations = useRecoilValue(botRuntimeOperationsSelector);

  const handleBotStop = () => {
    botRuntimeOperations?.stopBot(projectId);
  };

  const handleBotStart = async () => {
    const config: IPublishConfig | undefined = startBotConfig;
    if (botBuildRequired) {
      // Default recognizer
      botRuntimeOperations?.buildWithDefaultRecognizer(projectId, config);
    } else {
      // Regex recognizer
      botRuntimeOperations?.startBot(projectId, config);
    }
  };

  return (
    <Fragment>
      {currentBotStatus === BotStatus.connected ? (
        <button onClick={handleBotStop}>
          <Icon iconName={'CircleStopSolid'} styles={icon} />
        </button>
      ) : (
        <button onClick={handleBotStart}>
          <Icon iconName={'Play'} styles={icon} />
        </button>
      )}
      <span aria-label={displayName}>{displayName}</span>
    </Fragment>
  );
};
