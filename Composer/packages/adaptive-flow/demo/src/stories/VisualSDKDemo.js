import React, { Component } from 'react';
import { DialogFactory, dialogGroups, DialogGroup } from '@bfc/shared';

import { EdgeMenu } from '../../../src/components/menus/EdgeMenu';
import { JsonBlock } from '../components/json-block';
import { renderUIWidget } from '../../../src/schema/flowSchemaRenderer';
import { FlowSchemaProvider } from '../../../src/schema/flowSchemaProvider';
import { defaultFlowSchema } from '../../../src/schema/defaultFlowSchema';

import './story.css';

const uiSchemaPrivider = new FlowSchemaProvider(defaultFlowSchema);
const actionFactory = new DialogFactory({});

export class VisualSDKDemo extends Component {
  state = {
    actions: this.seedInitialActions(),
  };

  seedInitialActions() {
    const initialTypes = [
      ...dialogGroups[DialogGroup.RESPONSE].types,
      ...dialogGroups[DialogGroup.INPUT].types,
      ...dialogGroups[DialogGroup.BRANCHING].types,
      ...dialogGroups[DialogGroup.LOOPING].types,
      ...dialogGroups[DialogGroup.MEMORY].types,
      ...dialogGroups[DialogGroup.STEP].types,
      ...dialogGroups[DialogGroup.CODE].types,
      ...dialogGroups[DialogGroup.LOG].types,
    ];
    const initalActions = initialTypes.map((t) => actionFactory.create(t));
    return initalActions;
  }

  insertActionPreview($kind) {
    // prettier-ignore
    this.setState({ // lgtm [js/react/inconsistent-state-update]
      actions: [this.factory.create($kind), ...this.state.actions],
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
              width: '300px',
              height: '80px',
              fontSize: '8px',
            }}
            defaultValue={action}
            onSubmit={(newAction) => {
              const newActions = [...this.state.actions];
              newActions[index] = newAction;
              this.setState({
                actions: newActions,
              });
            }}
          />
        </div>
        <div className="action-preview--visual" style={{ marginLeft: 20 }}>
          {renderUIWidget(uiSchemaPrivider.get(action.$kind), {
            id: `actions[${index}]`,
            data: action,
            onEvent: () => null,
          })}
        </div>
      </div>
    );
  }

  renderActionFactory() {
    return (
      <div style={{ width: '100%', height: 100, margin: 20 }}>
        <h3>Create action by $kind</h3>
        <EdgeMenu id="visual-sdk-demo" onClick={($kind) => this.insertActionPreview($kind)} />
      </div>
    );
  }

  render() {
    return (
      <div className="story-container">
        <h1 className="story-title">Visual SDK Demo</h1>
        <div className="story-content" style={{ display: 'flex', flexFlow: 'wrap' }}>
          {this.renderActionFactory()}
          {this.state.actions.map((action, index) => this.renderActionPreview(action, index))}
        </div>
      </div>
    );
  }
}
