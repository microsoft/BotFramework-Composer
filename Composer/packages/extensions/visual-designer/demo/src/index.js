import React, { Component } from 'react';
import { render } from 'react-dom';
import { Nav } from 'office-ui-fabric-react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { EditorConfig } from '../../src/editors/editorConfig';

import { VisualEditorDemo } from './stories/VisualEditorDemo';
import { StepEditorDemo } from './stories/StepEditorDemo';
import { EventsEditorDemo } from './stories/EventsEditorDemo';
import './index.css';

initializeIcons(undefined, { disableWarnings: true });

EditorConfig.features.showEvents = true;

const DemoMaps = {
  VisualEditorDemo: {
    key: 'VisualEditorDemo',
    component: VisualEditorDemo,
  },
  StepEditorDemo: {
    key: 'StepEditorDemo',
    component: StepEditorDemo,
  },
  EventsEditorDemo: {
    key: 'EventsEditorDemo',
    component: EventsEditorDemo,
  },
};

class Demo extends Component {
  state = {
    selectedItem: DemoMaps.VisualEditorDemo.key,
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
                key: DemoMaps.StepEditorDemo.key,
                name: 'Step Editor',
              },
              {
                key: DemoMaps.EventsEditorDemo.key,
                name: 'Event Editor',
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
