import React, { Component } from 'react';

import { ObiEditor } from './components/obi-editor/ObiEditor';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  onChange = newData => {
    var newData = {
      name: this.props.data.name, // this editor should not change file name
      content: JSON.stringify(newData, null, 4),
    };
    this.props.onChange(newData);
  };

  onClick = item => {
    this.props.shellApi.openSubEditor('right', item, newData => {
      console.log('data get back from sub editor');
      console.log(newData);
    });
  };

  getLabel = item => {
    if (item && item.dialog) {
      if (item.dialog.$type) {
        return item.dialog.$type;
      }
    } else {
      return item.$type;
    }
  };

  render() {
    const data = JSON.parse(this.props.data.content);

    return (
      <div className="visualdesigner-container" data-testid="visualdesigner-container">
        <ObiEditor data={data} onClickDialog={item => this.onClick(item)} />
      </div>
    );
  }
}
