/* eslint-disable no-unused-vars */
import React, { FunctionComponent } from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const UnknownIntentRule: FunctionComponent<NodeProps> = ({
  id,
  data,
  focusedId,
  onEvent,
} = defaultNodeProps) => {
  return <RuleCard id={id} data={data} label={data.$type.split('.')[1]} focusedId={focusedId} onEvent={onEvent} />;
};
