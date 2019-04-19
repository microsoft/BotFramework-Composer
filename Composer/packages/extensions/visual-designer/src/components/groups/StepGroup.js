import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../OffsetContainer';
import { DynamicStyledComponent } from '../shared/DynamicStyledComponent';
import { VerticalEdge } from '../shared/Edges';

const StepInterval = 20;

export class StepGroup extends DynamicStyledComponent {
  width = 0;
  height = 0;

  prevData = {};
  boxes = [];
  edges = [];

  computeProps() {
    const { id, data, focusedId } = this.props;
    if (!data || !Array.isArray(data.children)) return;

    this.boxes = data.children.map((step, index) => {
      const node = new GraphObjectModel();
      node.props = {
        id: `${id}[${index}]`,
        data: step,
        focusedId: focusedId,
        onEvent: (...args) => this.props.onEvent(...args),
      };
      return node;
    });
  }

  measureLayout() {
    const steps = this.boxes;
    steps.forEach(x => {
      x.boundary = x.ref.current.getBoundary();
    });

    this.width = Math.max(...steps.map(x => x.boundary.width));
    this.height =
      steps.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
      StepInterval * Math.max(steps.length - 1, 0);

    steps.reduce((offsetY, node) => {
      node.offset = { x: (this.width - node.boundary.width) / 2, y: offsetY };
      return offsetY + node.boundary.height + StepInterval;
    }, 0);

    this.edges = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const { boundary, offset } = steps[i];
      const x = boundary.out.x + offset.x;
      const y = boundary.out.y + offset.y;
      this.edges.push(<VerticalEdge key={`stepGroup.edges[${i}]`} length={StepInterval} x={x} y={y} />);
    }
  }

  renderContent() {
    return (
      <div style={{ width: this.width, height: this.height, position: 'relative' }}>
        {this.boxes.map((x, index) => (
          <OffsetContainer key={`stepGroup.offset[${index}]`} offset={x.offset}>
            <NodeRenderer key={`stepGroup[${index}}]`} ref={x.ref} {...x.props} />
          </OffsetContainer>
        ))}
        {this.edges}
      </div>
    );
  }
}

StepGroup.propTypes = NodeProps;
StepGroup.defaultProps = defaultNodeProps;
