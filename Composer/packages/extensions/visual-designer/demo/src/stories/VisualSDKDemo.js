import React, { Component } from 'react';

import { resolveAdaptiveDataRenderer } from '../../../src/adaptive/rendererMap';
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
            {this.renderSDKPreview()}
          </div>
        </div>
      </div>
    );
  }
}
