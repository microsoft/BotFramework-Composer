import React from 'react';

import { PAYLOAD_KEY } from '../../utils/constant';

import { NodeProps, defaultNodeProps } from './sharedProps';
import { chooseRendererByType } from './nodeRenderer';

const IntentHeight = 50;
const IntentMargin = 10;
const IntentBlockHeight = IntentHeight + 2 * IntentMargin;
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
          width: 200,
          height: intents.length * IntentBlockHeight + ContainerBonusHeight,
          border: '0.25px solid #000000',
          boxSizing: 'border-box',
        }}
      >
        {intents.map(x => this.renderIntent(x))}
      </div>
    );
  }
}

IntentGroup.propTypes = NodeProps;
IntentGroup.defaultProps = defaultNodeProps;
