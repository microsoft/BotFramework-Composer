import React, { Component } from 'react';
import { render } from 'react-dom';

import './style.css';
import { JsonBlock } from './components/json-block';
import { ObiEditor } from '../../src/components/obi-editor/ObiEditor';

import * as obiExample from './sample.dialog';
import { applyTransformer } from '../../src/transformers/applyTransformer';
import { RuleDialogTransformer } from '../../src/transformers/RuleDialogTransformer';

class Demo extends Component {
  transform = input => applyTransformer(input, RuleDialogTransformer);

  state = {
    obiJson: obiExample,
    directedGraphSchema: this.transform(obiExample),
  };

  constructor(props) {
    super(props);
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({
      obiJson: json,
      directedGraphSchema: this.transform(json),
    });
  }

  render() {
    const { obiJson, directedGraphSchema } = this.state;
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
            <code>{JSON.stringify(directedGraphSchema, null, '\t')}</code>
          </div>
          <div className="block block--right">
            <ObiEditor
              data={obiJson}
              width={400}
              height={500}
              onClickDialog={nodeContent => {
                console.log('Clicked node:', nodeContent);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));

// TODO: import babel plugin to auto bind 'this' pointer
