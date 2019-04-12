import React from 'react';

import { PAYLOAD_KEY } from '../../utils/constant';
import { NodeProps, defaultNodeProps } from '../nodes/sharedProps';
import { chooseRendererByType } from '../../utils/nodeRendererMap';

const IntentElementHeight = 50;
const IntentMarginX = 18;
const IntentMarginY = 20;
const IntentBlockHeight = IntentElementHeight + 2 * IntentMarginY;
const ContainerBonusHeight = 10;

export class IntentGroup extends React.Component {
  renderIntent(intent) {
    const data = intent[PAYLOAD_KEY];
    const ChosenRenderer = chooseRendererByType(data.$type);
    const propagateEvent = (...args) => this.props.onEvent(...args);
    return <ChosenRenderer id={intent.id} key={intent.id} data={data} onEvent={propagateEvent} />;
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
              padding: `${IntentMarginY}px ${IntentMarginX}px`,
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
