import React, { Component } from 'react';
import { render } from 'react-dom';

import { ObiEditor } from '../../src/components/ObiEditor';
import { obiTransformer } from '../../src/transformers/ObiTransformer';

import { JsonBlock } from './components/json-block';
import * as obiExample from './sample.dialog';
import './style.css';

class Demo extends Component {
  state = {
    obiJson: obiExample,
    directedGraphSchema: obiTransformer.toGraphSchema(obiExample),
  };

  constructor(props) {
    super(props);
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({
      obiJson: json,
      directedGraphSchema: obiTransformer.toGraphSchema(json),
    });
  }

  render() {
    const { obiJson, directedGraphSchema } = this.state;
    const logEvent = eventType => eventData => {
      console.log('Event triggered:', eventType, eventData);
    };

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
              onSelect={logEvent('select')}
              onExpand={logEvent('expand')}
              onOpen={logEvent('open')}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));

// TODO: import babel plugin to auto bind 'this' pointer
