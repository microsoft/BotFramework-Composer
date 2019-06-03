import React from 'react';
import PropTypes from 'prop-types';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { ObiTypes } from '../shared/ObiTypes';
import { deleteNode, insertBefore, insertAfter, unshiftArray } from '../shared/jsonTracker';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';
import './ObiEditor.css';

export const ObiEditor = ({ path, focusedId, data, onSelect, onExpand, onOpen, onChange }) => {
  const dispatchEvent = (eventName, eventData) => {
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
        handler = e => onChange(deleteNode(data, e.id));
        break;
      case NodeEventTypes.InsertBefore:
        handler = e => onChange(insertBefore(data, e.id, e.$type));
        break;
      case NodeEventTypes.InsertAfter:
        handler = e => onChange(insertAfter(data, e.id, e.$type));
        break;
      case NodeEventTypes.Insert:
        handler = e => onChange(unshiftArray(data, e.id, e.$type));
        break;
      default:
        handler = onSelect;
        break;
    }
    return handler(eventData);
  };

  const chooseEditor = $type => {
    if ($type === ObiTypes.AdaptiveDialog) {
      return AdaptiveDialogEditor;
    }
    return RuleEditor;
  };

  const renderFallbackContent = () => {
    return null;
  };

  if (!data) return renderFallbackContent();

  const ChosenEditor = chooseEditor(data.$type);
  return (
    <div
      tabIndex="0"
      className="obi-editor-container"
      data-testid="obi-editor-container"
      style={{ width: '100%', height: '100%' }}
      onKeyUp={e => {
        const keyString = e.key;
        if (keyString === 'Delete' && focusedId) {
          dispatchEvent(NodeEventTypes.Delete, { id: focusedId });
        }
      }}
    >
      <ChosenEditor
        id={path}
        data={data}
        expanded={true}
        focusedId={focusedId}
        onEvent={(...args) => dispatchEvent(...args)}
      />
    </div>
  );
};

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
