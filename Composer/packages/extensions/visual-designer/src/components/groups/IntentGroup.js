import React from 'react';

import { PAYLOAD_KEY } from '../../utils/constant';
import { NodeProps, defaultNodeProps } from '../nodes/sharedProps';
import { NodeRenderer } from '../../utils/NodeRenderer';

const IntentElementHeight = 50;
const IntentMarginX = 18;
const IntentMarginY = 20;
const IntentBlockHeight = IntentElementHeight + 2 * IntentMarginY;
const ContainerBonusHeight = 10;

export class IntentGroup extends React.Component {
  renderIntent(intent) {
    const { focusedId } = this.props;
    const data = intent[PAYLOAD_KEY];
    const propagateEvent = (...args) => this.props.onEvent(...args);
    return <NodeRenderer id={intent.id} data={data} focusedId={focusedId} onEvent={propagateEvent} />;
  }
  render() {
    const { data } = this.props;
    const intents = data.children || [];
    return (
      <div
        style={{
          width: 206,
          height: intents.length * IntentBlockHeight + ContainerBonusHeight,
          border: '0.25px solid #000000',
          boxSizing: 'border-box',
        }}
      >
        {intents.map(x => (
          <div
            key={x.id + 'block'}
            style={{
              margin: `${IntentMarginY}px ${IntentMarginX}px`,
              height: IntentElementHeight,
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
