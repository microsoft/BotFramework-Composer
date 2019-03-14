import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { SimpleGraph } from '../../dist/examples/simple/SimpleGraph';

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

ReactDOM.render(<SimpleGraph items={demoItems} />, document.querySelector('#demo'));
