// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const IntentRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent } = defaultNodeProps) => {
  return <RuleCard id={id} data={data} label={data.intent} focusedId={focusedId} onEvent={onEvent} />;
};
