import React, { Component } from 'react';
import { render } from 'react-dom';

import './style.css';
import { JsonBlock } from './components/json-block';
import { DialogFlowEditor } from '../../src/components/dialog-flow-editor';
import { ObiTransformer } from '../../src/utils/obi-transformer';

import * as obiExample from '../../ObiSamples/Planning 5 - WelcomeRule/main.dialog';

class Demo extends Component {
  obiTransformer = new ObiTransformer();

  state = {
    obiJson: obiExample,
    directedGraphSchema: this.obiTransformer.toDirectedGraphSchema(obiExample),
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
    const graphItems = this.state.directedGraphSchema;
    return (
      <div>
        <h1>visual-designer Demo</h1>
        <div className="demo-container">
          <div className="block block--left">
            <p>Input your OBI json here.</p>
            <JsonBlock defaultValue={obiExample} onSubmit={this.onJsonChanged.bind(this)} />
          </div>
          <div className="block block--middle">
            <p>Preview your Directed Graph Schema here.</p>
            <code>{JSON.stringify(graphItems, null, '\t')}</code>
          </div>
          <div className="block block--right">
            <p>Here is your visualized dialog flow.</p>
            <DialogFlowEditor items={graphItems} width={400} height={500} />
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));

// TODO: import babel plugin to auto bind 'this' pointer
