import React, { Component } from 'react';

import { ObiEditor } from './components/obi-editor/ObiEditor';
import { NodeClickActionTypes, PAYLOAD_KEY } from './utils/constant';
import { isRecognizerType, isRuleType, isRefType } from './utils/obiTypeInferrers';

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
    return '';
  };

  inferClickActions = node => {
    const { payload } = node;
    const { $type: nodeType } = payload;
    const { Expand, Focus, OpenLink } = NodeClickActionTypes;

    if (!nodeType) {
      return Focus;
    }

    if (isRecognizerType(nodeType)) {
      return Focus;
    } else if (isRuleType(nodeType)) {
      if (Array.isArray(payload.steps)) return Expand;
      else return Focus;
    } else if (isRefType(nodeType)) {
      return OpenLink;
    }
    return null;
  };

  onClick = node => {
    const { navDown, focusTo, navTo } = this.props.shellApi;
    const { Expand, Focus, OpenLink } = NodeClickActionTypes;

    const subPath = this.normalizeDataPath(node.id);

    switch (this.inferClickActions(node)) {
      case Expand:
        navDown(subPath);
        break;
      case Focus:
        focusTo(subPath);
        break;
      case OpenLink:
        // TODO: OBI schema no longer uses file path as dialogref. Align with new schema when runtime supports it.
        const refDialogFile = node.payload[PAYLOAD_KEY];
        const regexResult = refDialogFile.match(/.+\/(.+)\.dialog$/);
        if (regexResult && regexResult[1]) {
          navTo(regexResult[1]);
        } else {
          navTo(refDialogFile);
        }
        break;
      default:
        focusTo(subPath);
        break;
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
