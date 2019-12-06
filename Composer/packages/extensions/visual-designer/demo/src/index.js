import React, { Component } from 'react';
import { render } from 'react-dom';
import { Nav } from 'office-ui-fabric-react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { EditorConfig } from '../../src/editorConfig';

import { VisualEditorDemo } from './stories/VisualEditorDemo';
import { VisualSDKDemo } from './stories/VisualSDKDemo';
import { AdaptiveEventEditorDemo } from './stories/AdaptiveEventEditorDemo';
import { AdaptiveDialogEditorDemo } from './stories/AdaptiveDialogEditorDemo';
import './index.css';

initializeIcons(undefined, { disableWarnings: true });

EditorConfig.features.showEvents = true;

const DemoMaps = {
  VisualEditorDemo: {
    key: 'VisualEditorDemo',
    component: VisualEditorDemo,
  },
  VisualSDKDemo: {
    key: 'VisualSDKDemo',
    component: VisualSDKDemo,
  },
  AdaptiveEventEditorDemo: {
    key: 'AdaptiveEventEditorDemo',
    component: AdaptiveEventEditorDemo,
  },
  AdaptiveDialogEditorDemo: {
    key: 'AdaptiveDialogEditorDemo',
    component: AdaptiveDialogEditorDemo,
  },
};

class Demo extends Component {
  state = {
    selectedItem: DemoMaps.AdaptiveEventEditorDemo.key,
  };

  renderNav() {
    return (
      <Nav
        styles={{ root: { width: 300 } }}
        expandButtonAriaLabel="Expand or collapse"
        selectedKey={this.state.selectedItem}
        onLinkClick={(e, item) => {
          this.setState({
            selectedItem: item.key,
          });
        }}
        groups={[
          {
            name: 'Editor Demos',
            links: [
              {
                key: DemoMaps.VisualEditorDemo.key,
                name: 'Visual Editor',
              },
              {
                key: DemoMaps.VisualSDKDemo.key,
                name: 'Adaptive Visual SDK',
              },
              {
                key: DemoMaps.AdaptiveEventEditorDemo.key,
                name: 'Adaptive Event Editor',
              },
              {
                key: DemoMaps.AdaptiveDialogEditorDemo.key,
                name: 'Adaptive Dialog Editor',
              },
            ],
          },
          {
            name: 'Component Demos',
            links: [],
          },
        ]}
      />
    );
  }

  renderContent() {
    const SelectedComponent = DemoMaps[this.state.selectedItem].component;
    return <SelectedComponent />;
  }

  render() {
    return (
      <div className="demo-container">
        <div className="demo-nav">{this.renderNav()}</div>
        <div className="demo-content">{this.renderContent()}</div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
