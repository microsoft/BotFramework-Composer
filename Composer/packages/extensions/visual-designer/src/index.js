import React, { Component, Fragment } from 'react';

import { DialogFlowEditor } from './components/dialog-flow-editor';

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
      <div>
        <div> Dialog Visual Designer2223 </div>
        <DialogFlowEditor></DialogFlowEditor>
        <div> {data.$type} </div>

        {data.$type === 'Microsoft.SequenceDialog' ? (
          <Fragment>
            {data.sequence.map((item, index) => {
              return (
                <div key={index} onClick={() => this.onClick(item, index)}>
                  {' '}
                  step {index} {item && this.getLabel(item)}
                </div>
              );
            })}
          </Fragment>
        ) : (
          <Fragment>
            <div>click here</div>
          </Fragment>
        )}
      </div>
    );
  }
}
