import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';

const RuleElementHeight = 32;
const RuleElementWidth = 180;
const RulePaddingX = 28;
const RulePaddingY = 28;
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

    return (
      <div>
        <div
          style={{
            margin: '0 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexWrap: 'wrap',
          }}
          ref={el => {
            this.containerElement = el;
            this.propagateBoundary();
          }}
        >
          {rules.map((x, index) => (
            <div
              key={x.id + 'block'}
              style={{
                margin: `0 ${(index + 1) % 3 === 0 ? 0 : RulePaddingX}px, ${RulePaddingY}px 0`,
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
