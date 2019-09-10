import React, { Component } from 'react';

import VisualDesigner from '../../../src';
import { JsonBlock } from '../components/json-block';
import { ObiExamples } from '../samples';
import { EditorConfig } from '../../../src/editors/editorConfig';
import './VisualEditorDemo.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

// Simulate the condition that json is always mutated.
const copyJson = json => JSON.parse(JSON.stringify(json));

EditorConfig.features.showEvents = true;

export class VisualEditorDemo extends Component {
  state = {
    selectedFile: defaultFile,
    obiJson: ObiExamples[defaultFile],
    focusedEvent: '',
    focusedSteps: [],
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({
      selectedFile: file,
      obiJson: copyJson(ObiExamples[file]),
      focusedEvent: 'rules[0]',
      focusedSteps: [],
    });
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({ obiJson: json });
  }

  render() {
    const { selectedFile, obiJson, focusedEvent, focusedSteps } = this.state;

    return (
      <div className="ve-container">
        <h1 className="ve-title">visual-designer Demo</h1>
        <div className="ve-content">
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
              styles={{
                width: '95%',
                height: 'calc(100% - 150px)',
                minHeight: '500px',
              }}
              defaultValue={obiJson}
              onSubmit={this.onJsonChanged.bind(this)}
            />
          </div>
          <div className="block block--right">
            <VisualDesigner
              data={obiJson}
              dialogId={selectedFile}
              focusedEvent={focusedEvent}
              focusedSteps={focusedSteps}
              shellApi={{
                navTo: e => {
                  console.log('navTo', e);
                },
                onFocusEvent: id => {
                  console.log('onFocusEvent', id);
                  this.setState({
                    focusedEvent: id,
                    focusedSteps: [],
                  });
                },
                onFocusSteps: stepIds => {
                  console.log('onFocusSteps', stepIds);
                  this.setState({
                    focusedSteps: stepIds,
                  });
                },
                saveData: json => {
                  this.setState({
                    obiJson: json,
                  });
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
