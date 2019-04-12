import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';
import { DirectedGraph } from '../../src/examples/directed/DirectedGraph';

// Must use a class style React compnent rather than a function component.
class ExampleContent extends React.Component<any> {
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

const reportNodeId = (nodeId: string) => {
  console.log(`Node ${nodeId} clicked.`);
};

const demoAssets: any[] = [
  // 1 - Colorful exmaple
  [
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
  ],
  // 2 - Integer id
  [
    {
      id: 1,
      value: 'root',
      neighborIds: [2, 3],
    },
    {
      id: 2,
      value: 'leaf',
      neighborIds: [],
    },
    {
      id: 3,
      value: 'leaf',
      neighborIds: [],
    },
  ],
];

// Bind default renderer and click event.
for (let demoItem of demoAssets) {
  for (let item of demoItem) {
    item.contentRenderer = ExampleContent;
    item.footRenderer = ExampleFooter;
    item.onClick = reportNodeId;
  }
}

class Demo extends React.Component {
  state = {
    itemIndex: 0,
  };

  showNextJson() {
    let nextIndex = this.state.itemIndex + 1;
    nextIndex = nextIndex % demoAssets.length;
    this.setState({ itemIndex: nextIndex });
  }

  render() {
    const displayedJson = demoAssets[this.state.itemIndex];
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ minWidth: 600 }}>
          <button onClick={() => this.showNextJson()}>Change Json</button>
          <DirectedGraph items={displayedJson} width={600} height={700} />
        </div>
        <div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
            {JSON.stringify(displayedJson, null, '\t')}
          </pre>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.querySelector('#demo'));
