import React, { Component } from 'react';

import { AdaptiveEventEditor } from '../../../src/containers/AdaptiveEventEditor';
import { NodeEventTypes } from '../../../src/constants/NodeEventTypes';
import { JsonBlock } from '../components/json-block';
import ToDoBot from '../samples/todo/ToDoBot.main.json';

import './story.css';

export class AdaptiveEventEditorDemo extends Component {
  state = {
    json: ToDoBot.triggers[0],
    focusedActionId: '',
    focusedTabId: '',
    selectedIds: [],
  };

  handleEditorEvent = (eventName, e) => {
    switch (eventName) {
      case NodeEventTypes.Focus:
        this.setState({ focusedActionId: e.id, focusedTabId: e.tab });
        break;
    }
  };

  renderEditor() {
    const { json, focusedActionId, focusedTabId, selectedIds } = this.state;
    return (
      <AdaptiveEventEditor
        dialogId="todo"
        eventPath="triggers[0["
        eventData={json}
        focusedId={focusedActionId}
        focusedTab={focusedTabId}
        selectedIds={selectedIds}
        onEvent={this.handleEditorEvent}
      />
    );
  }

  render() {
    return (
      <div className="story-container">
        <h1 className="story-title">Visual SDK Demo</h1>
        <div className="story-content">
          <div className="block block--left">
            <JsonBlock
              styles={{
                width: '95%',
                height: 'calc(100% - 100px)',
                minHeight: '500px',
              }}
              defaultValue={this.state.json}
              onSubmit={json => {
                this.setState({ json });
              }}
            />
          </div>
          <div className="block block--right" style={{ padding: 10 }}>
            {this.renderEditor()}
          </div>
        </div>
      </div>
    );
  }
}
