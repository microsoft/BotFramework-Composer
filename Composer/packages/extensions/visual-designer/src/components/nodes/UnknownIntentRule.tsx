// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

function renderTitle(data) {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    // data.$type.split('.')[1]
    return 'Handle Unknown Intent';
  }
}

export const UnknownIntentRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent }) => {
  return <RuleCard id={id} data={data} label={renderTitle(data)} focusedId={focusedId} onEvent={onEvent} />;
};
UnknownIntentRule.defaultProps = defaultNodeProps;
