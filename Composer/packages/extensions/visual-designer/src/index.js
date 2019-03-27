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
  inferPath = (dialog, data) => {
    if (dialog.rules) {
      const index = dialog.rules.findIndex(e => JSON.stringify(e) === JSON.stringify(data));
      return `.rules[${index}]`;
    }
    return '';
  };

  onClick = item => {
    const subPath = this.inferPath(this.props.data, item);
    this.props.shellApi.focusTo(subPath);
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
