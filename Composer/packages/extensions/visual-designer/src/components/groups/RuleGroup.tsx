import React from 'react';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../../shared/Boundary';
import { EventNodeSize, EventNodeLayout } from '../../shared/elementSizes';

const RuleElementHeight = EventNodeSize.height;
const RuleElementWidth = EventNodeSize.width;
const RulePaddingX = EventNodeLayout.marginX;
const RulePaddingY = EventNodeLayout.marginY;
const RuleBlockWidth = RuleElementWidth + RulePaddingX;
const RuleBlockHeight = RuleElementHeight + RulePaddingY;

export class RuleGroup extends React.Component<NodeProps> {
  static defaultProps = defaultNodeProps;
  containerElement;

  propagateBoundary(): void {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderRule(rule, index: number): JSX.Element {
    const { id, focusedId, onEvent } = this.props;
    const elementId = `${id}[${index}]`;
    return (
      <div
        key={elementId + 'block'}
        style={{
          width: RuleBlockWidth,
          height: RuleBlockHeight,
          boxSizing: 'border-box',
        }}
      >
        <NodeRenderer
          id={elementId}
          data={rule}
          focusedId={focusedId}
          onEvent={onEvent}
          onResize={() => {
            this.propagateBoundary();
          }}
        />
      </div>
    );
  }

  render(): JSX.Element {
    const { data } = this.props;
    const rules = data.children || [];

    return (
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
        }}
        ref={el => {
          this.containerElement = el;
          this.propagateBoundary();
        }}
      >
        {rules.map((x, i) => this.renderRule(x, i))}
      </div>
    );
  }
}
