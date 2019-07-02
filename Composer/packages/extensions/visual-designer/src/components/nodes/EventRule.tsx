// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const EventRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent }) => {
  return <RuleCard id={id} data={data} label={data.events} focusedId={focusedId} onEvent={onEvent} />;
};
EventRule.defaultProps = defaultNodeProps;
