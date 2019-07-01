import React, { FunctionComponent } from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const IntentRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent }) => {
  return <RuleCard id={id} data={data} label={data.intent} focusedId={focusedId} onEvent={onEvent} />;
};

IntentRule.defaultProps = defaultNodeProps;
