// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { BaseSchema } from '@bfc/shared';

import { Boundary } from '../models/Boundary';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { StepRenderer } from '../components/renderers/StepRenderer';

export interface AdaptiveActionProps {
  path: string;
  data: BaseSchema;
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
  onResize?: (boundary?: Boundary) => any;
}

export const AdaptiveAction: FC<AdaptiveActionProps> = ({ path, data, onEvent, onResize }) => {
  return <StepRenderer id={path} data={data} onEvent={onEvent} onResize={onResize} />;
};

AdaptiveAction.defaultProps = {
  onResize: () => null,
};
