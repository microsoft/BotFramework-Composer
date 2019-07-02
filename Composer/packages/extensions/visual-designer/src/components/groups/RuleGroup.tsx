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

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderRule(rule) {
    const { focusedId, getLgTemplates, onEvent } = this.props;
    const data = rule.json;
    return (
      <NodeRenderer
        id={rule.id}
        data={data}
        focusedId={focusedId}
        getLgTemplates={getLgTemplates}
        onEvent={onEvent}
        onResize={() => {
          this.propagateBoundary();
        }}
      />
    );
  }

  render() {
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
        {rules.map(x => (
          <div
            key={x.id + 'block'}
            style={{
              width: RuleBlockWidth,
              height: RuleBlockHeight,
              boxSizing: 'border-box',
            }}
          >
            {this.renderRule(x)}
          </div>
        ))}
      </div>
    );
  }
}
