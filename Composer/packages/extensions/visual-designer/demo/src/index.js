import React, { Component } from 'react';
import { render } from 'react-dom';

import { ObiEditor } from '../../src/editors/ObiEditor';

import { JsonBlock } from './components/json-block';
import { ObiExamples } from './samples';
import './style.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

class Demo extends Component {
  state = {
    selectedFile: defaultFile,
    obiJson: ObiExamples[defaultFile],
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({ selectedFile: file, obiJson: ObiExamples[file] });
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({ obiJson: json });
  }

  render() {
    const { selectedFile, obiJson } = this.state;
    const logEventThunk = eventType => eventData => {
      console.log('Event triggered:', eventType, eventData);
    };

    return (
      <div>
        <h1>visual-designer Demo</h1>
        <div className="demo-container">
          <div className="block block--left">
            <div>Select built-in schemas:</div>
            <select
              style={{ width: 200, height: 30, fontSize: 20 }}
              value={this.state.selectedFile}
              onChange={e => {
                const val = e.target.value;
                this.onFileSelected(val);
              }}
            >
              {sampleFileNames.map(x => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <p>Or input your OBI json here.</p>
            <JsonBlock
              key={`jsonblock-${selectedFile}`}
              width={800}
              height={800}
              defaultValue={obiJson}
              onSubmit={this.onJsonChanged.bind(this)}
            />
          </div>
          <div className="block block--right">
            <ObiEditor
              data={obiJson}
              path={selectedFile}
              onSelect={logEventThunk('select')}
              onExpand={logEventThunk('expand')}
              onOpen={logEventThunk('open')}
              onChange={json => {
                this.setState({
                  obiJson: json,
                });
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
