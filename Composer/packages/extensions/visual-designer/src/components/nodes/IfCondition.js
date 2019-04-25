import React, { useEffect, useState, useMemo } from 'react';

import { transformIfCondtion } from '../../transformers/transformIfCondition';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { ifElseLayouter } from '../../layouters/ifelseLayouter';

import { Diamond } from './templates/Diamond';

const ChoiceNodeWidth = 50;
const ChoiceNodeHeight = 20;

const calculateNodeMap = (path, data) => {
  const { choice, ifGroup, elseGroup } = transformIfCondtion(data, path);
  return {
    choiceNode: choice ? new GraphObjectModel(choice.id, choice.json) : null,
    ifGroupNode: ifGroup ? new GraphObjectModel(ifGroup.id, ifGroup.json) : null,
    elseGroupNode: elseGroup ? new GraphObjectModel(elseGroup.id, elseGroup.json) : null,
  };
};

const calculateLayout = (nodeMap, boundaryMap) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach(x => (x.boundary = boundaryMap[x.id] || new Boundary()));
  if (nodeMap.choiceNode) nodeMap.choiceNode.boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

  return ifElseLayouter(nodeMap.choiceNode, nodeMap.ifGroupNode, nodeMap.elseGroupNode);
};

export const IfCondition = function({ id, data, focusedId, onEvent, onResize }) {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const layout = useMemo(() => calculateLayout(initialNodeMap, boundaryMap), [initialNodeMap, boundaryMap]);

  const patchBoundary = (id, boundary) => {
    if (!boundaryMap[id] || !areBoundariesEqual(boundaryMap[id], boundary)) {
      setBoundaryMap({
        ...boundaryMap,
        [id]: boundary,
      });
    }
  };

  useEffect(() => {
    onResize(layout.boundary);
  }, [layout]);

  const { boundary, nodeMap, edges } = layout;
  return (
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={nodeMap.choice.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeClickActionTypes.Focus, id);
          }}
        />
      </OffsetContainer>
      {[nodeMap.if, nodeMap.else]
        .filter(x => !!x)
        .map(x => (
          <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
            <StepGroup
              key={x.id}
              id={x.id}
              ref={x.ref}
              data={x.data}
              focusedId={focusedId}
              onEvent={onEvent}
              onResize={size => {
                patchBoundary(x.id, size);
              }}
            />
          </OffsetContainer>
        ))}
      {edges.map(x => (
        <Edge key={x.id} {...x} />
      ))}
    </div>
  );
};

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
