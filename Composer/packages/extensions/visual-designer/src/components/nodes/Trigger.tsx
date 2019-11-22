// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { ConceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import {
  triggerContainerStyle,
  triggerContentStyle,
  titleStyle,
  subtitleStyle,
  triggerIconStyle,
} from './triggerStyles';

function getLabel(data: any): string {
  const labelOverrides = ConceptLabels[data.$type];
  if (labelOverrides) {
    return labelOverrides.subtitle || labelOverrides.title;
  }
  return data.$type;
}

function getName(data: any): string {
  if (data && data.$designer && data.$designer.name) {
    return data.$designer.name;
  }
  return getLabel(data);
}

export const Trigger = ({ data, onClick = () => {} }): JSX.Element => {
  const name = getName(data);
  const label = getLabel(data);

  return (
    <div css={triggerContainerStyle}>
      <div css={triggerContentStyle}>
        <div css={titleStyle}>
          <Icon iconName="Flow" style={triggerIconStyle} />
          <span>{name}</span>
        </div>
        <div css={subtitleStyle}>{label}</div>
      </div>
    </div>
  );
};
