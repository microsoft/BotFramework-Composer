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

  onClick = item => {
    this.props.shellApi.openSubEditor('right', item, newData => {
      console.log('data get back from sub editor');
      console.log(newData);
    });
  };

  render() {
    const data = JSON.parse(this.props.data.content);

    return (
      <div data-testid="visualdesigner-container">
        <ObiEditor data={data} onClickDialog={item => this.onClick(item)} />
      </div>
    );
  }
}
