import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../OffsetContainer';
import { DynamicLayoutComponent } from '../shared/DynamicLayoutComponent';
import { VerticalEdge } from '../shared/Edges';
import { Boundary } from '../shared/Boundary';

const StepInterval = 20;

export class StepGroup extends DynamicLayoutComponent {
  boundary = new Boundary();

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
        data: step.json,
        focusedId: focusedId,
        onEvent: (...args) => this.props.onEvent(...args),
      };
      return node;
    });
  }

  getBoundary() {
    return this.boundary;
  }

  measureLayout() {
    const steps = this.boxes;
    steps.forEach(x => {
      x.boundary = x.ref.current.getBoundary();
    });

    this.boundary.axisX = Math.max(0, ...steps.map(x => x.boundary.axisX));
    this.boundary.width = this.boundary.axisX + Math.max(0, ...steps.map(x => x.boundary.width - x.boundary.axisX));
    this.boundary.height =
      steps.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
      StepInterval * Math.max(steps.length - 1, 0);

    steps.reduce((offsetY, node) => {
      node.offset = { x: this.boundary.axisX - node.boundary.axisX, y: offsetY };
      return offsetY + node.boundary.height + StepInterval;
    }, 0);

    this.edges = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const { boundary, offset } = steps[i];
      const x = this.boundary.axisX;
      const y = boundary.height + offset.y;
      this.edges.push(<VerticalEdge key={`stepGroup.edges[${i}]`} length={StepInterval} x={x} y={y} />);
    }
  }

  renderContent() {
    return (
      <div style={{ width: this.boundary.width, height: this.boundary.height, position: 'relative' }}>
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
