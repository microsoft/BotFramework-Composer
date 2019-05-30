import React from 'react';

import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { RuleGroup } from '../components/groups';

export const TriggerEditor = ({ id, data, focusedId, onEvent }) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '31px',
        border: '1px solid #000000',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      <RuleGroup id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
    </div>
  );
};

TriggerEditor.propTypes = NodeProps;
TriggerEditor.defaultProps = defaultNodeProps;
