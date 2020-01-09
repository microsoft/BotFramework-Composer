import React, { Component } from 'react';
import { seedNewDialog, SDKTypes } from '@bfc/shared';

import { UISchemaRenderer } from '../../../src/schema/uischemaRenderer';
import { EdgeMenu } from '../../../src/components/menus/EdgeMenu';
import { JsonBlock } from '../components/json-block';

import './story.css';

export class VisualSDKDemo extends Component {
  state = {
    actions: this.seedInitialActions(),
  };

  seedInitialActions() {
    const initialTypes = [
      SDKTypes.SendActivity,
      SDKTypes.EditArray,
      SDKTypes.InitProperty,
      SDKTypes.SetProperties,
      SDKTypes.SetProperty,
      SDKTypes.DeleteProperties,
      SDKTypes.DeleteProperty,
      SDKTypes.BeginDialog,
      SDKTypes.EndDialog,
      SDKTypes.RepeatDialog,
      SDKTypes.ReplaceDialog,
      SDKTypes.CancelAllDialogs,
      SDKTypes.EmitEvent,
    ];
    const initalActions = initialTypes.map(t => seedNewDialog(t));
    return initalActions;
  }

  appendActionPreview($type) {
    this.setState({
      actions: [...this.state.actions, seedNewDialog($type)],
    });
  }

  renderActionPreview(action, index) {
    return (
      <div
        className="action-preview"
        key={`action-preview-${index}`}
        style={{ display: 'flex', flexDirection: 'row', margin: 10 }}
      >
        <div className="action-preview--raw">
          <JsonBlock
            styles={{
              width: '200px',
              height: '80px',
              fontSize: '8px',
            }}
            defaultValue={action}
            onSubmit={newAction => {
              const newActions = [...this.state.actions];
              newActions[index] = newAction;
              this.setState({
                actions: newActions,
              });
            }}
          />
        </div>
        <div className="action-preview--visual">
          <UISchemaRenderer id={`actions[${index}]`} data={action} onEvent={() => null} />
        </div>
      </div>
    );
  }

  renderActionFactory() {
    return (
      <div style={{ height: 100, margin: 20 }}>
        <h3>Create action by $type</h3>
        <EdgeMenu id="visual-sdk-demo" onClick={$type => this.appendActionPreview($type)} />
      </div>
    );
  }

  render() {
    return (
      <div className="story-container">
        <h1 className="story-title">Visual SDK Demo</h1>
        <div className="story-content" style={{ display: 'flex', flexFlow: 'wrap' }}>
          {this.state.actions.map((action, index) => this.renderActionPreview(action, index))}
          {this.renderActionFactory()}
        </div>
      </div>
    );
  }
}
