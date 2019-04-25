import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { NodeRenderer } from '../shared/NodeRenderer';

import { EventGroup } from './EventGroup';
import { IntentGroup } from './IntentGroup';

const ElementMargin = 10;

export const RecognizerGroup = ({ data, focusedId, onEvent, nodeRefs, selectedNodes }) => {
  console.log('r', nodeRefs, selectedNodes);
  const renderElement = (node, Renderer) => {
    if (node) {
      return (
        <div style={{ margin: ElementMargin }}>
          <Renderer
            key={node.id}
            id={node.id}
            data={node.json}
            focusedId={focusedId}
            onEvent={onEvent}
            nodeRefs={nodeRefs}
            selectedNodes={selectedNodes}
          />
        </div>
      );
    }
    return null;
  };

  const { recognizer, eventGroup, intentGroup } = data;
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
        onEvent(NodeClickActionTypes.Focus, '');
      }}
    >
      {renderElement(recognizer, NodeRenderer)}
      {renderElement(eventGroup, EventGroup)}
      {renderElement(intentGroup, IntentGroup)}
    </div>
  );
};

RecognizerGroup.propTypes = NodeProps;
RecognizerGroup.defaultProps = defaultNodeProps;
