import React, { Component } from 'react';

import { ObiEditor } from './components/obi-editor/ObiEditor';

export default class VisualDesigner extends Component {
  constructor(props) {
    super(props);
  }

  onChange = newData => {
    const data = {
      name: this.props.data.name, // this editor should not change file name
      content: JSON.stringify(newData, null, 4),
    };
    this.props.onChange(data);
  };

  // infer the path of data in dialog
  // a very limited path inference, only work on ruleDialog
  // TODO: this should buit-in into node
  inferPath = (data, subData) => {
    if (data.rules) {
      const index = data.rules.findIndex(e => JSON.stringify(e) === JSON.stringify(subData));
      return `.rules[${index}]`;
    }
    if (data.steps) {
      const index = data.steps.findIndex(e => JSON.stringify(e) === JSON.stringify(subData));
      return `.steps[${index}]`;
    }
    return '';
  };

  onClick = item => {
    const subPath = this.inferPath(this.props.data, item);
    if (this.props.data.rules) {
      // means it's top level
      this.props.shellApi.navDown(subPath);
    } else {
      this.props.shellApi.focusTo(subPath);
    }
  };

  render() {
    const data = this.props.data;

    return (
      <div data-testid="visualdesigner-container">
        <ObiEditor data={data} onClickDialog={item => this.onClick(item)} />
      </div>
    );
  }
}
