import React, { Component } from 'react';
import { render } from 'react-dom';
import { Nav } from 'office-ui-fabric-react';

import { VisualEditorDemo } from './stories/VisualEditorDemo';
import { StepEditorDemo } from './stories/StepEditorDemo';
import './index.css';

const DemoMaps = {
  VisualEditorDemo: {
    key: 'VisualEditorDemo',
    component: VisualEditorDemo,
  },
  StepEditorDemo: {
    key: 'StepEditorDemo',
    component: StepEditorDemo,
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
