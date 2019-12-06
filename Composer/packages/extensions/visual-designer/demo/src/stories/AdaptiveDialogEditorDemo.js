import React, { Component } from 'react';

import { AdaptiveDialogEditor } from '../../../src/containers/AdaptiveDialogEditor';
import { NodeEventTypes } from '../../../src/constants/NodeEventTypes';
import { JsonBlock } from '../components/json-block';
import ToDoBot from '../samples/todo/ToDoBot.main.json';

import './AdaptiveDialogEditorDemo.css';

export class AdaptiveDialogEditorDemo extends Component {
  state = {
    json: ToDoBot,
    focusedEventId: '',
    focusedActionId: '',
    focusedTabId: '',
    selectedIds: [],
  };

  handleEditorEvent = (eventName, e) => {
    switch (eventName) {
      case NodeEventTypes.FocusEvent:
        this.setState({ focusedEventId: e, focusedActionId: '', focusedTabId: '' });
        break;
      case NodeEventTypes.Focus:
        this.setState({ focusedActionId: e.id, focusedTabId: e.tab });
        break;
    }
  };

  renderEditor() {
    const { json, focusedEventId, focusedActionId, focusedTabId, selectedIds } = this.state;
    return (
      <AdaptiveDialogEditor
        dialogId=""
        dialogData={json}
        focusedEvent={focusedEventId}
        focusedAction={focusedActionId}
        focusedTab={focusedTabId}
        selectedIds={selectedIds}
        onEvent={this.handleEditorEvent}
      />
    );
  }

  render() {
    return (
      <div className="demo-container">
        <h1 className="demo-title">Visual SDK Demo</h1>
        <div className="demo-content">
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
