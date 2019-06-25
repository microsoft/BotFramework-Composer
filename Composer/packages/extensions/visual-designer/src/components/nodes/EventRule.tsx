import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const EventRule = ({ id, data, focusedId, onEvent }) => {
  return (
    <RuleCard id={id} data={data} themeColor="#B2D20E" label={data.events} focusedId={focusedId} onEvent={onEvent} />
  );
};
EventRule.propTypes = NodeProps;
EventRule.defaultProps = defaultNodeProps;
