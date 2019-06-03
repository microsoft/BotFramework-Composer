import React, { Component } from 'react';

import { transformRootDialog } from '../../../src/transformers/transformRootDialog';
import { NodeEventTypes } from '../../../src/shared/NodeEventTypes';
import { StepEditor } from '../../../src/editors/StepEditor';
import { JsonBlock } from '../components/json-block';
import { ObiExamples } from '../samples';

import './StepEditorDemo.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

// Simulate the condition that json is always mutated.
const copyJson = json => JSON.parse(JSON.stringify(json));

export class StepEditorDemo extends Component {
  state = {
    selectedFile: defaultFile,
    obiJson: ObiExamples[defaultFile],
    focusPath: '',
    focusedStep: '',
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({
      selectedFile: file,
      obiJson: copyJson(ObiExamples[file]),
      focusPath: file,
      focusedStep: '',
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
    const { stepGroup } = transformRootDialog(obiJson);

    return (
      <div className="se-container">
        <h1 className="se-title">visual-designer Demo</h1>
        <div className="se-content">
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
            <StepEditor
              key={this.state.focusPath}
              id={stepGroup.id}
              focusedId={this.state.focusedStep}
              data={stepGroup.json}
              focusPath={focusPath}
              onEvent={(eventName, data) => {
                switch (eventName) {
                  case NodeEventTypes.Focus:
                  case NodeEventTypes.Expand:
                    this.setState({
                      focusedStep: data,
                    });
                    break;
                  default:
                    console.log('StepEditor fires event', eventName, data);
                    break;
                }
                console.log('event', eventName, data);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
