import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';

const IntentPaddingX = 18;
const IntentPaddingY = 20;
const IntentElementHeight = 50;
const IntentElementWidth = 170;
const IntentBlockWidth = IntentElementWidth + 2 * IntentPaddingX;
const IntentBlockHeight = IntentElementHeight + 2 * IntentPaddingY;
const BonusHeight = 50;

export class IntentGroup extends React.Component {
  containerElement;

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderIntent(intent) {
    const { focusedId, onEvent, nodeRefs, selectedNodes } = this.props;
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
        nodeRefs={nodeRefs}
        selectedNodes={selectedNodes}
      />
    );
  }

  render() {
    const { data } = this.props;
    const intents = data.children || [];

    const width = IntentBlockWidth;
    const height = IntentBlockHeight * intents.length + BonusHeight;

    return (
      <div
        style={{
          width,
          height,
          border: '0.25px solid #000000',
          boxSizing: 'border-box',
        }}
        ref={el => {
          this.containerElement = el;
          this.propagateBoundary();
        }}
      >
        {intents.map(x => (
          <div
            key={x.id + 'block'}
            style={{
              padding: `${IntentPaddingY}px ${IntentPaddingX}px`,
              height: IntentBlockHeight,
              boxSizing: 'border-box',
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
