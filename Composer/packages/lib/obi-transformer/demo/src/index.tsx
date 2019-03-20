import React, { Component } from 'react';
import { render } from 'react-dom';
import { DirectedGraph } from 'cci-graph-lib';

const demoItems = [
  {
    id: 'node_0',
    value: 'green',
    neighborIds: ['node_1', 'node_2'],
  },
  {
    id: 'node_1',
    value: 'red',
    neighborIds: ['node_4'],
  },
  {
    id: 'node_2',
    value: 'blue',
    neighborIds: ['node_3'],
  },
  {
    id: 'node_3',
    value: 'green',
    neighborIds: ['node_4'],
  },
  {
    id: 'node_4',
    value: 'blue',
    neighborIds: [],
  },
];

class Node extends Component {
  render() {
    return (
      <div>
        <p>Node</p>
        {JSON.stringify(this.props['data'])}
      </div>
    );
  }
}

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

render(<Demo />, document.querySelector('#demo'));
