import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';

const TaskElementHeight = 36;
const TaskElementWidth = 227;
const TaskPaddingX = 28;
const TaskPaddingY = 31;
const TaskBlockWidth = TaskElementWidth + TaskPaddingX;
const TaskBlockHeight = TaskElementHeight + TaskPaddingY;

export class TaskGroup extends React.Component {
  containerElement;

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderTask(task) {
    const { focusedId, onEvent } = this.props;
    const data = task.json;
    return (
      <NodeRenderer
        id={task.id}
        data={data}
        focusedId={focusedId}
        onEvent={onEvent}
        onResize={() => {
          this.propagateBoundary();
        }}
      />
    );
  }

  render() {
    const { data } = this.props;
    const tasks = data.children || [];

    const width = TaskBlockWidth * 2;
    const height = TaskBlockHeight * Math.round(tasks.length / 2);

    return (
      <div>
        <div
          style={{
            width,
            height,
            boxSizing: 'border-box',
            display: 'flex',
            flexWrap: 'wrap',
          }}
          ref={el => {
            this.containerElement = el;
            this.propagateBoundary();
          }}
        >
          {tasks.map(x => (
            <div
              key={x.id + 'block'}
              style={{
                padding: `${TaskPaddingY}px ${TaskPaddingX}px 0 0`,
                width: TaskBlockWidth,
                height: TaskBlockHeight,
                boxSizing: 'border-box',
              }}
            >
              {this.renderTask(x)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

TaskGroup.propTypes = NodeProps;
TaskGroup.defaultProps = defaultNodeProps;
