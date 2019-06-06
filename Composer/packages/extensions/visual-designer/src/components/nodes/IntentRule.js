import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const IntentRule = ({ id, data, focusedId, onEvent }) => {
  return (
    <RuleCard id={id} data={data} themeColor="#BFEAE9" label={data.intent} focusedId={focusedId} onEvent={onEvent} />
  );
};

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
