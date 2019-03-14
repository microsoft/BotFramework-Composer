import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { SimpleGraph } from '../../dist/examples/simple/SimpleGraph';

// Must use a class style React compnent rather than a function component.
class ExampleContent extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <div className={`simple-item-content ${data.value}`} onClick={() => data.onClick(data.id)}>
        This is content: {JSON.stringify(data)}
      </div>
    );
  }
}

class ExampleFooter extends React.Component {
  render() {
    return <div>I'm a footer of {this.props['nodeId']}</div>;
  }
}

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

demoItems.forEach(item => {
  item.contentRenderer = ExampleContent;
  item.footRenderer = ExampleFooter;
});

ReactDOM.render(<SimpleGraph items={demoItems} />, document.querySelector('#demo'));
