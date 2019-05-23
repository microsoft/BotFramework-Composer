import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';
import { ElementWidth, ElementHeight } from '../shared/NodeMeta';

const IntentBlockPaddingX = 70;
const IntentPaddingX = 17;
const IntentPaddingY = 32;
const IntentElementHeight = ElementHeight;
const IntentElementWidth = ElementWidth;
const DoubleIntentBlockWidth = (IntentElementWidth + IntentPaddingX + IntentBlockPaddingX + 1) * 2; // border: 1px
const SingleIntentBlockWidth = IntentElementWidth + (IntentBlockPaddingX + 1) * 2;
const IntentBlockHeight = IntentElementHeight + 2 * IntentPaddingY;

export class IntentGroup extends React.Component {
  containerElement;

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderIntent(intent) {
    const { focusedId, onEvent } = this.props;
    const data = intent.json;
    return (
      <NodeRenderer
        id={intent.id}
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
    const intents = data.children || [];
    const width = intents.length > 1 ? DoubleIntentBlockWidth : SingleIntentBlockWidth;
    const height = IntentBlockHeight * Math.round(intents.length / 2);

    return (
      <div
        style={{
          width,
          height,
          padding: `0 ${IntentBlockPaddingX}px ${IntentPaddingY}px`,
          border: '1px solid #A4A4A4',
          boxSizing: 'border-box',
        }}
        ref={el => {
          this.containerElement = el;
          this.propagateBoundary();
        }}
      >
        {intents.map((x, index) => (
          <div
            key={x.id + 'block'}
            style={{
              padding:
                intents.length > 1
                  ? `${IntentPaddingY}px ${index % 2 === 0 ? IntentPaddingX : 0}px 0 ${
                      index % 2 === 0 ? 0 : IntentPaddingX
                    }px`
                  : `${IntentPaddingY}px 0px`,
              height: IntentBlockHeight,
              boxSizing: 'border-box',
              display: 'inline-block',
            }}
          >
            {this.renderIntent(x)}
          </div>
        ))}
      </div>
    );
  }
}

IntentGroup.propTypes = NodeProps;
IntentGroup.defaultProps = defaultNodeProps;
