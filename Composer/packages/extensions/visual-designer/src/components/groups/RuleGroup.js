import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';

const RuleElementHeight = 36;
const RuleElementWidth = 227;
const RulePaddingX = 28;
const RulePaddingY = 31;
const RuleBlockWidth = RuleElementWidth + RulePaddingX;
const RuleBlockHeight = RuleElementHeight + RulePaddingY;

export class RuleGroup extends React.Component {
  containerElement;

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderRule(rule) {
    const { focusedId, onEvent } = this.props;
    const data = rule.json;
    return (
      <NodeRenderer
        id={rule.id}
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
    const rules = data.children || [];

    const width = RuleBlockWidth * 2;
    const height = RuleBlockHeight * Math.round(rules.length / 2);

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
          {rules.map(x => (
            <div
              key={x.id + 'block'}
              style={{
                padding: `${RulePaddingY}px ${RulePaddingX}px 0 0`,
                width: RuleBlockWidth,
                height: RuleBlockHeight,
                boxSizing: 'border-box',
              }}
            >
              {this.renderRule(x)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

RuleGroup.propTypes = NodeProps;
RuleGroup.defaultProps = defaultNodeProps;
