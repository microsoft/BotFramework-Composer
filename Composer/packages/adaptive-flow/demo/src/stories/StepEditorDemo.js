import React, { Component } from 'react';

import { transformObiRules } from '../../../src/transformers/transformObiRules';
import { NodeEventTypes } from '../../../src/constants/NodeEventTypes';
import { StepEditor } from '../../../src/editors/StepEditor';
import { NodeRendererContext } from '../../../src/store/NodeRendererContext';
import { JsonBlock } from '../components/json-block';
import { ObiExamples } from '../samples';

import './StepEditorDemo.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

// Simulate the condition that json is always mutated.
const copyJson = (json) => JSON.parse(JSON.stringify(json));

const getStepData = (obiJson) => transformObiRules(obiJson.events[0]).stepGroup;

export class StepEditorDemo extends Component {
  state = {
    selectedFile: defaultFile,
    stepData: getStepData(ObiExamples[defaultFile]),
    focusPath: '',
    focusedId: '',
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({
      selectedFile: file,
      stepData: getStepData(copyJson(ObiExamples[file])),
      focusPath: file,
      focusedId: '',
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
      stepData: getStepData(copyJson(this.state.stepData)),
    });
  }

  render() {
    const { selectedFile, stepData, focusPath } = this.state;

    return (
      <div className="se-container">
        <h1 className="se-title">Step Editor Demo</h1>
        <div className="se-content">
          <div className="block block--left">
            <div>Select built-in schemas:</div>
            <select
              style={{ width: 200, height: 30, fontSize: 20 }}
              value={this.state.selectedFile}
              onChange={(e) => {
                const val = e.target.value;
                this.onFileSelected(val);
              }}
            >
              {sampleFileNames.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <p>Step data:</p>
            <JsonBlock
              key={`jsonblock-${selectedFile}`}
              styles={{
                width: '95%',
                height: 'calc(100% - 150px)',
                minHeight: '500px',
              }}
              defaultValue={stepData}
              onSubmit={this.onJsonChanged.bind(this)}
            />
          </div>
          <div className="block block--right">
            <NodeRendererContext.Provider value={this.state}>
              <StepEditor
                key={this.state.focusPath}
                id={stepData.id}
                data={stepData.json}
                focusPath={focusPath}
                onEvent={(eventName, data) => {
                  switch (eventName) {
                    case NodeEventTypes.Focus:
                    case NodeEventTypes.Expand:
                      this.setState({
                        focusedId: data,
                      });
                      break;
                    default:
                      console.log('StepEditor fires event', eventName, data);
                      break;
                  }
                  console.log('event', eventName, data);
                }}
              />
            </NodeRendererContext.Provider>
          </div>
        </div>
      </div>
    );
  }
}
