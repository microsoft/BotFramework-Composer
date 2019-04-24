import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';

const IntentPaddingX = 18;
const IntentPaddingY = 20;
const IntentElementHeight = 50;
const IntentElementWidth = 170;
const IntentBlockWidth = IntentElementWidth + 2 * IntentPaddingX;
const IntentBlockHeight = IntentElementHeight + 2 * IntentPaddingY;
const BonusHeight = 50;

export class IntentGroup extends React.Component {
  width = 0;
  height = 0;

  renderIntent(intent) {
    const { focusedId } = this.props;
    const data = intent.json;
    const propagateEvent = (...args) => this.props.onEvent(...args);
    return <NodeRenderer id={intent.id} data={data} focusedId={focusedId} onEvent={propagateEvent} />;
  }

  render() {
    const { data } = this.props;
    const intents = data.children || [];

    this.width = IntentBlockWidth;
    this.height = IntentBlockHeight * intents.length + BonusHeight;

    return (
      <div
        style={{
          width: this.width,
          height: this.height,
          border: '0.25px solid #000000',
          boxSizing: 'border-box',
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
