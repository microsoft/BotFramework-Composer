// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { ConceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import get from 'lodash/get';

import {
  triggerContainerStyle,
  triggerContentStyle,
  titleStyle,
  subtitleStyle,
  triggerIconStyle,
  titleContentStyle,
} from './triggerStyles';

function getLabel(data: any): string {
  const labelOverrides = ConceptLabels[data.$kind];
  if (labelOverrides) {
    return labelOverrides.subtitle || labelOverrides.title;
  }
  return data.$kind;
}

function getName(data: any): string {
  return (
    data.intent || get(data, '$designer.name', ConceptLabels[data.$kind] ? ConceptLabels[data.$kind].title : data.$kind)
  );
}

export const Trigger = ({ data, onClick = () => {} }): JSX.Element => {
  const name = getName(data);
  const label = getLabel(data);

  return (
    <div css={triggerContainerStyle}>
      <div css={triggerContentStyle}>
        <div css={titleStyle}>
          <Icon iconName="Flow" style={triggerIconStyle} />
          <h1 css={titleContentStyle}>{name}</h1>
        </div>
        <div css={subtitleStyle} className="trigger__content-label">
          {label}
        </div>
      </div>
    </div>
  );
};
