import React, { Component } from 'react';
import { render } from 'react-dom';

import './style.css';
import { JsonBlock } from './components/json-block';
import { DialogFlowEditor } from '../../src/components/dialog-flow-editor';
import { ObiTransformer } from '../../src/utils/obi-transformer';

const defaultJsonData = {
  type: 'Microsoft.Botframework',
};

class Demo extends Component {
  obiTransformer = new ObiTransformer();

  state = {
    obiJson: defaultJsonData,
    directedGraphSchema: this.obiTransformer.toDirectedGraphSchema(defaultJsonData),
  };

  constructor(props) {
    super(props);
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    const dgSchema = this.obiTransformer.toDirectedGraphSchema(json);
    this.setState({
      directedGraphSchema: dgSchema,
    });
  }

  render() {
    const { nodes, edges } = this.state.directedGraphSchema;
    return (
      <div>
        <h1>visual-designer Demo</h1>
        <div className="demo-container">
          <div className="block block--left">
            <JsonBlock defaultValue={defaultJsonData} onSubmit={this.onJsonChanged.bind(this)} />
          </div>
          <div className="block block--middle">
            <code>{JSON.stringify(this.state.directedGraphSchema, null, '\t')}</code>
          </div>
          <div className="block block--right" style={{ width: 400, height: 600 }}>
            <DialogFlowEditor behaviouralNodes={nodes} pipelineEdges={edges} />
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));

// TODO: import babel plugin to auto bind 'this' pointer
