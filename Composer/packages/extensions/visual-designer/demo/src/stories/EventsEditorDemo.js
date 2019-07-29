import React, { Component } from 'react';

import { transformRootDialog } from '../../../src/transformers/transformRootDialog';
import { NodeEventTypes } from '../../../src/shared/NodeEventTypes';
import { EventsEditor } from '../../../src/editors/EventsEditor';
import { NodeRendererContext } from '../../../src/store/NodeRendererContext';
import { JsonBlock } from '../components/json-block';
import { ObiExamples } from '../samples';

import './StepEditorDemo.css';

const sampleFileNames = Object.keys(ObiExamples);
const defaultFile = sampleFileNames[1];

const getEventData = obiJson => transformRootDialog(obiJson).ruleGroup;

export class EventsEditorDemo extends Component {
  state = {
    selectedFile: defaultFile,
    data: getEventData(ObiExamples[defaultFile]),
    focusPath: '',
    focusedId: '',
  };

  constructor(props) {
    super(props);
  }

  onFileSelected(file) {
    this.setState({
      selectedFile: file,
      data: getEventData(ObiExamples[file]),
      focusPath: file,
      focusedId: '',
    });
  }

  onJsonChanged(json) {
    console.log('json changed:', json);
    this.setState({ data: json });
  }

  onFocus(id) {
    console.log('focus node', id);
    this.setState({
      focusPath: this.state.selectedFile + id,
      data: getEventData(this.state.data),
    });
  }

  render() {
    const { selectedFile, data, focusPath } = this.state;

    return (
      <div className="se-container">
        <h1 className="se-title">Step Editor Demo</h1>
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
            <p>Step data:</p>
            <JsonBlock
              key={`jsonblock-${selectedFile}`}
              styles={{
                width: '95%',
                height: 'calc(100% - 150px)',
                minHeight: '500px',
              }}
              defaultValue={data}
              onSubmit={this.onJsonChanged.bind(this)}
            />
          </div>
          <div className="block block--right">
            <NodeRendererContext.Provider value={this.state}>
              <EventsEditor
                key={this.state.focusPath}
                id={data.id}
                data={data.json}
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
