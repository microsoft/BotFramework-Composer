import React, { Component } from 'react';

import { ObiEditor } from './components/ObiEditor';

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

  /**
   * This function is used to normalized the path string:
   *
   * - 'node.id' is always a jsonPath-styled string indicates
   *    where it comes from the whole OBI json.
   *    Like '$.rules[0]'.
   *
   * -  Shell API requires a path without the '$' prefix.
   *    Like '.rules[0]'.
   */
  normalizeDataPath = jsonPathString => {
    if (jsonPathString && jsonPathString[0] === '$') {
      return jsonPathString.substr(1);
    }
    return jsonPathString;
  };

  applyNormalizePathMiddleware = handler => eventData => {
    const clickedNodePath = eventData;
    handler(this.normalizeDataPath(clickedNodePath));
  };

  render() {
    const { data, shellApi } = this.props;
    const { navDown, focusTo, navTo } = shellApi;

    return (
      <div data-testid="visualdesigner-container">
        <ObiEditor
          data={data}
          onSelect={this.applyNormalizePathMiddleware(focusTo)}
          onExpand={this.applyNormalizePathMiddleware(navDown)}
          onOpen={this.applyNormalizePathMiddleware(navTo)}
        />
      </div>
    );
  }
}
