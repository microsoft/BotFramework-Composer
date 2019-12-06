// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import get from 'lodash/get';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { ObiFieldNames } from '../constants/ObiFieldNames';

import { AdaptiveEventList } from './list/AdaptiveEventList';

export interface AdaptiveDialogProps {
  path: string;
  data: MicrosoftAdaptiveDialog;
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
}

export const AdaptiveDialog: FC<AdaptiveDialogProps> = ({ data, onEvent }): JSX.Element => {
  const eventsPath = ObiFieldNames.Events;
  const events = get(data, eventsPath, []);

  return <AdaptiveEventList path={eventsPath} events={events} onEvent={onEvent} />;
};
