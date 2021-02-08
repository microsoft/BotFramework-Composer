// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { conceptLabels, getFriendlyName } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import {
  triggerContainerStyle,
  triggerContentStyle,
  titleStyle,
  subtitleStyle,
  triggerIconStyle,
  titleContentStyle,
} from './triggerStyles';

function getLabel(data: any): string {
  const labelOverrides = conceptLabels()[data.$kind];
  if (labelOverrides) {
    return labelOverrides.subtitle || labelOverrides.title;
  }
  return data.$kind;
}

export const TriggerSummary = ({ data, onClick = () => {} }): JSX.Element => {
  const name = getFriendlyName(data);
  const label = getLabel(data);

  return (
    <div css={triggerContainerStyle}>
      <div css={triggerContentStyle}>
        <div css={titleStyle}>
          <Icon iconName="LightningBolt" style={triggerIconStyle} />
          <h1 css={titleContentStyle}>{name}</h1>
        </div>
        <div className="trigger__content-label" css={subtitleStyle}>
          {label}
        </div>
      </div>
    </div>
  );
};
