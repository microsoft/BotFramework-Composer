import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { ObiTypes } from '../shared/ObiTypes';
import { deleteNode } from '../shared/jsonTracker';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';
import './ObiEditor.css';

export class ObiEditor extends Component {
  dispatchEvent(eventName, eventData) {
    const { onSelect, onExpand, onOpen, onChange } = this.props;

    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = onSelect;
        break;
      case NodeEventTypes.Expand:
        handler = onExpand;
        break;
      case NodeEventTypes.OpenLink:
        handler = onOpen;
        break;
      case NodeEventTypes.Delete:
        handler = e => onChange(deleteNode(this.props.data, e.id));
        break;
      default:
        handler = onSelect;
        break;
    }
    return handler(eventData);
  }

  chooseEditor($type) {
    if ($type === ObiTypes.AdaptiveDialog) {
      return AdaptiveDialogEditor;
    }
    return RuleEditor;
  }

  renderFallbackContent() {
    return null;
  }

  render() {
    const { path, focusedId, data } = this.props;
    if (!data) return this.renderFallbackContent();

    const ChosenEditor = this.chooseEditor(data.$type);
    return (
      <div
        tabIndex="0"
        className="obi-editor-container"
        data-testid="obi-editor-container"
        style={{ width: '100%', height: '100%' }}
        onKeyUp={e => {
          const keyString = e.key;
          if (keyString === 'Delete' && focusedId) {
            this.dispatchEvent(NodeEventTypes.Delete, { id: focusedId });
          }
        }}
      >
        <ChosenEditor
          key={path}
          id={path}
          data={this.props.data}
          expanded={true}
          focusedId={focusedId}
          onEvent={(...args) => this.dispatchEvent(...args)}
        />
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  path: '.',
  focusedId: '',
  data: {},
  onSelect: () => {},
  onExpand: () => {},
  onOpen: () => {},
  onChange: () => {},
};

ObiEditor.propTypes = {
  path: PropTypes.string,
  focusedId: PropTypes.string,
  // Obi raw json
  data: PropTypes.object,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
  onOpen: PropTypes.func,
  onChange: PropTypes.func,
};
