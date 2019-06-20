import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { ObiTypes } from '../shared/ObiTypes';
import { deleteNode, insert } from '../shared/jsonTracker';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';
import './ObiEditor.css';

function getScrollParent(node) {
  if (!node || node === document) return null;

  const isNodeOverflow = node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth;
  // REF: https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
  const isNodeScrollable = getComputedStyle(node).overflow.match(/(auto|scroll|hidden)/);

  if (isNodeOverflow && isNodeScrollable) {
    return node;
  }
  return getScrollParent(node.parentNode);
}

export const ObiEditor = ({ path, focusedId, data, onSelect, onExpand, onOpen, onChange }) => {
  const isDragging = useRef(false);
  const dragStartPoint = useRef({ x: 0, y: 0 });

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
        handler = e => {
          onChange(deleteNode(data, e.id));
          onSelect(e);
        };
        break;
      case NodeEventTypes.Insert:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onSelect(`${e.id}[${e.position || 0}]`);
        };
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
      style={{ width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box' }}
      onKeyUp={e => {
        const keyString = e.key;
        if (keyString === 'Delete' && focusedId) {
          dispatchEvent(NodeEventTypes.Delete, { id: focusedId });
        }
      }}
      onClick={e => {
        e.stopPropagation();
        dispatchEvent(NodeEventTypes.Focus, '');
      }}
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
        isDragging.current = true;
        dragStartPoint.current.x = e.pageX;
        dragStartPoint.current.y = e.pageY;
      }}
      onMouseUp={e => {
        e.preventDefault();
        e.stopPropagation();
        isDragging.current = false;
      }}
      onMouseLeave={() => {
        isDragging.current = false;
      }}
      onMouseMove={e => {
        if (isDragging.current) {
          const mouseMove = {
            x: e.pageX - dragStartPoint.current.x,
            y: e.pageY - dragStartPoint.current.y,
          };
          const scrollParent = getScrollParent(e.currentTarget);
          if (scrollParent) {
            scrollParent.scrollBy(-mouseMove.x, -mouseMove.y);
            dragStartPoint.current.x = e.pageX;
            dragStartPoint.current.y = e.pageY;
          } else {
            window.scrollBy(-mouseMove.x, -mouseMove.y);
          }
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
