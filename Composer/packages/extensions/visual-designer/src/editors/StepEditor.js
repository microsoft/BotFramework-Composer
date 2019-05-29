import React from 'react';

import { StepGroup } from '../components/groups';
import { EdgeMenu } from '../components/shared/EdgeMenu';
import { NodeEventTypes } from '../shared/NodeEventTypes';

export const StepEditor = ({ id, data, focusedId, onEvent }) => {
  if (!data) {
    return null;
  }

  if (!Array.isArray(data.children) || data.children.length === 0) {
    return <EdgeMenu onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type })} />;
  }
  return <StepGroup id={id} data={data} focusedId={focusedId} onEvent={onEvent} />;
};
