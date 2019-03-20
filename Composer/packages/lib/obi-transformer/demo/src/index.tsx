import React, { Component } from 'react';
import { render } from 'react-dom';
import { DirectedGraph } from 'cci-graph-lib';

import { ObiTransformer } from '../../src/transformer';
import * as sampleJson from './sample.json';

const transformer = new ObiTransformer();
const PAYLOAD_KEY = 'json';
const demoItems = transformer.toDirectedGraphSchema(sampleJson, PAYLOAD_KEY);

class Demo extends Component {
  render() {
    const items = demoItems.map(x => ({
      ...x,
      contentRenderer: Node,
      footerRenderer: null,
    }));
    return (
      <div>
        <p>Hello</p>
        <DirectedGraph items={items} />
      </div>
    );
  }
}

class Node extends Component {
  render() {
    const data = this.props['data'][PAYLOAD_KEY];
    return (
      <div
        style={{
          width: 200,
          height: 100,
          border: '1px solid black',
          overflow: 'hidden',
          overflowWrap: 'break-word',
        }}
      >
        <div>Type: {data['$type']}</div>
        <div>Steps: {data['steps'] ? data['steps'].length : 0}</div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
