import React, { Component } from 'react';

import VisualDesigner from '../../../src';
import { JsonBlock } from '../components/json-block';
import { ObiExamples } from '../samples';
import './VisualEditorDemo.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

// Simulate the condition that json is always mutated.
const copyJson = json => JSON.parse(JSON.stringify(json));

export class VisualEditorDemo extends Component {
  state = {
    selectedFile: defaultFile,
    obiJson: ObiExamples[defaultFile],
    focusPath: '',
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({
      selectedFile: file,
      obiJson: copyJson(ObiExamples[file]),
      focusPath: file,
    });
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({ obiJson: json });
  }

  onFocus(id) {
    console.log('focus node', id);
    this.setState({
      focusPath: this.state.selectedFile + id,
      obiJson: copyJson(this.state.obiJson),
    });
  }

  render() {
    const { selectedFile, obiJson, focusPath } = this.state;

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
            <VisualDesigner
              data={obiJson}
              navPath={selectedFile}
              focusPath={focusPath}
              shellApi={{
                navDown: e => {
                  console.log('navDown', e);
                  this.onFocus(e);
                },
                navTo: e => {
                  console.log('navTo', e);
                  this.onFocus(e);
                },
                focusTo: e => {
                  console.log('focusTo', e);
                  this.onFocus(e);
                },
              }}
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
