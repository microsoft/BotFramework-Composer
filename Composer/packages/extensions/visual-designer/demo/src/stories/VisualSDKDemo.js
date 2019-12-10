import React, { Component } from 'react';
import { seedNewDialog } from '@bfc/shared';

import { resolveAdaptiveDataRenderer } from '../../../src/adaptive/rendererMap';
import { EdgeMenu } from '../../../src/components/menus/EdgeMenu';
import { JsonBlock } from '../components/json-block';

import './story.css';

export class VisualSDKDemo extends Component {
  state = {
    json: {
      $type: 'Microsoft.SendActivity',
      activity: 'hello',
    },
  };

  renderSDKPreview() {
    const { json } = this.state;
    const Renderer = resolveAdaptiveDataRenderer(json);
    if (Renderer) {
      return <Renderer id={''} data={json} onEvent={(eventName, e) => console.log(eventName, e)} />;
    }
  }

  seedNewJson($type) {
    const json = seedNewDialog($type);
    this.setState({ json });
  }

  renderActionFactory() {
    return (
      <div style={{ height: 100, margin: 20 }}>
        <h3>Create action by $type</h3>
        <EdgeMenu id="visual-sdk-demo" onClick={$type => this.seedNewJson($type)} />
      </div>
    );
  }

  render() {
    return (
      <div className="story-container">
        <h1 className="story-title">Visual SDK Demo</h1>
        <div className="story-content">
          <div className="block block--left">
            {this.renderActionFactory()}
            <JsonBlock
              key={this.state.json && this.state.json.$type}
              styles={{
                width: '95%',
                height: '80%',
                minHeight: '500px',
              }}
              defaultValue={this.state.json}
              onSubmit={json => {
                this.setState({ json });
              }}
            />
          </div>
          <div className="block block--right" style={{ padding: 10 }}>
            {this.renderSDKPreview()}
          </div>
        </div>
      </div>
    );
  }
}
