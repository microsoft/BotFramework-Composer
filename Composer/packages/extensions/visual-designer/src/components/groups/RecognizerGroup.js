import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeEventTypes } from '../../shared/NodeEventTypes';

import { TaskGroup } from './TaskGroup';

const ElementMargin = 10;

export const RecognizerGroup = ({ data, focusedId, onEvent }) => {
  const renderElement = (node, Renderer) => {
    if (node) {
      return (
        <div style={{ margin: ElementMargin }}>
          <Renderer key={node.id} id={node.id} data={node.json} focusedId={focusedId} onEvent={onEvent} />
        </div>
      );
    }
    return null;
  };

  const { taskGroup } = data;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {renderElement(taskGroup, TaskGroup)}
    </div>
  );
};

RecognizerGroup.propTypes = NodeProps;
RecognizerGroup.defaultProps = defaultNodeProps;
