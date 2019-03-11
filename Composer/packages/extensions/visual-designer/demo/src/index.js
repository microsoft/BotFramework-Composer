import React, { Component } from 'react';
import { render } from 'react-dom';

import './style.css';
import { JsonBlock } from './components/json-block';
import { ObiVisualizer } from '../../src/components/obi-visualizer';

const defaultJsonData = {
  type: 'Microsoft.Botframework',
};

class Demo extends Component {
  defaultState = {
    demoJson: defaultJsonData,
    userInput: JSON.stringify(defaultJsonData),
  };

  state = this.defaultState;

  constructor(props) {
    super(props);
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
  }

  render() {
    return (
      <div>
        <h1>visual-designer Demo</h1>
        <div className="demo-container">
          <div className="block block--left">
            <JsonBlock defaultValue={defaultJsonData} onSubmit={this.onJsonChanged} />
          </div>
          <div className="block block--middle">Transformed node schema.</div>
          <div className="block block--right" style={{ width: 400, height: 600 }}>
            <ObiVisualizer />
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
