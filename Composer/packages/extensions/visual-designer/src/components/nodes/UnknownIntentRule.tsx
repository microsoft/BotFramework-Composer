import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

export const UnknownIntentRule = ({ id, data, focusedId, onEvent }) => {
  return (
    <RuleCard
      id={id}
      data={data}
      themeColor="#BFEAE9"
      label={data.$type.split('.')[1]}
      focusedId={focusedId}
      onEvent={onEvent}
    />
  );
};

UnknownIntentRule.propTypes = NodeProps;
UnknownIntentRule.defaultProps = defaultNodeProps;
