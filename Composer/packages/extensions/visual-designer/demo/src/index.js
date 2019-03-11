import React, { Component } from 'react';
import { render } from 'react-dom';

import './style.css';
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

  editingJson(e) {
    this.setState({
      userInput: e.target.value,
    });
  }

  submitInputJson() {
    this.setState(prevState => ({
      demoJson: JSON.parse(prevState.userInput),
    }));
  }

  resetJson() {
    this.setState(this.defaultState);
  }

  render() {
    return (
      <div>
        <h1>visual-designer Demo</h1>
        <div className="demo-container">
          <div className="block block--left">
            <textarea
              style={{ width: 400, height: 500 }}
              value={this.state.userInput}
              onChange={this.editingJson.bind(this)}
            />
            <div>
              <button onClick={this.submitInputJson.bind(this)}>Submit</button>
              <button onClick={this.resetJson.bind(this)}>Reset</button>
            </div>
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
