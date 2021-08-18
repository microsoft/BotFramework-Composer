// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { getFriendlyName, conceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { useMemo } from 'react';

import { StepRenderer } from '../AdaptiveAction';
import { NodeEventTypes } from '../../constants/NodeEventTypes';

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

export const TriggerSummary = ({ data, onEvent, onResize, id: triggerId }): JSX.Element => {
  const name = getFriendlyName(data);
  const label = getLabel(data);

  const memoizedRender = useMemo(() => {
    if (data.$kind === 'Microsoft.OnIntent') {
      return (
        <StepRenderer
          key={`stepGroup/${triggerId}`}
          data={data}
          id={triggerId}
          onEvent={() => {
            onEvent(NodeEventTypes.FocusEvent, triggerId);
            onEvent(NodeEventTypes.OpenPropertyPanel, {});
          }}
          onResize={onResize}
        />
      );
    } else {
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
    }
  }, [data]);

  return memoizedRender;
};
