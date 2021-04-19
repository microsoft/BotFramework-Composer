// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { checkForPVASchema } from '@bfc/shared';
import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { TooltipHost, ITooltipHostStyles } from 'office-ui-fabric-react/lib/Tooltip';
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, schemasState } from '../recoilModel';

const calloutProps = { gapSpace: 0 };
const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };

const genericDisableMessage = () => {
  return formatMessage('PVA bots cannot use this functionality at this time.');
};

export const PVADisableFeature: React.FC<{ content?: string; projectId?: string }> = (props) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const schema = useRecoilValue(schemasState(props.projectId ?? rootBotId ?? ''));
  const [isPVABot, setIsPVABot] = useState(false);

  useEffect(() => {
    setIsPVABot(checkForPVASchema(schema.sdk));
  }, [rootBotId]);

  const tooltipId = useId('tooltip');

  if (!isPVABot) {
    return <>{props.children}</>;
  }

  return (
    <TooltipHost
      calloutProps={calloutProps}
      content={props.content ?? genericDisableMessage()}
      // This id is used on the tooltip itself, not the host
      // (so an element with this id only exists when the tooltip is shown)
      id={tooltipId}
      styles={hostStyles}
    >
      {props.children}
    </TooltipHost>
  );
};
