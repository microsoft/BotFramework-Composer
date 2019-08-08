/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { deleteNode, insert, drop } from '../shared/jsonTracker';
import DragScroll from '../components/DragScroll';
import { NodeRendererContext } from '../store/NodeRendererContext';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export const ObiEditor: FC<ObiEditorProps> = ({ path, data, onSelect, onExpand, onOpen, onChange, isRoot }) => {
  let divRef;

  const { focusedId, removeLgTemplate } = useContext(NodeRendererContext);

  const dispatchEvent = (eventName: NodeEventTypes, eventData: any): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = onSelect;
        break;
      case NodeEventTypes.OpenDialog:
        handler = ({ caller, callee }) => onOpen(callee, caller);
        break;
      case NodeEventTypes.Delete:
        handler = e => {
          const cleanLgTemplate = (removedData: any): void => {
            if (removedData && removedData.$type === 'Microsoft.SendActivity') {
              if (removedData.activity && removedData.activity.indexOf('[bfdactivity-') !== -1) {
                removeLgTemplate('common', removedData.activity.slice(1, removedData.activity.length - 1));
              }
            }
          };
          onChange(deleteNode(data, e.id, cleanLgTemplate));
          onSelect('');
        };
        break;
      case NodeEventTypes.Insert:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onSelect(`${e.id}[${e.position || 0}]`);
        };
        break;
      case NodeEventTypes.Drop:
        handler = e => {
          const dialog = drop(data, e.id, e.position, e.source, e.copy);
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

  const renderFallbackContent = () => {
    return null;
  };

  if (!data) return renderFallbackContent();

  return (
    <div
      tabIndex={0}
      className="obi-editor-container"
      data-testid="obi-editor-container"
      css={{ width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box', '&:focus': { outline: 'none' } }}
      ref={el => (divRef = el)}
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
    >
      <DragScroll>
        <AdaptiveDialogEditor
          id={path}
          data={data}
          onEvent={(eventName, eventData) => {
            divRef.focus({ preventScroll: true });
            dispatchEvent(eventName, eventData);
          }}
        />
      </DragScroll>
    </div>
  );
};

ObiEditor.defaultProps = {
  path: '.',
  data: {},
  onSelect: () => {},
  onExpand: () => {},
  onOpen: () => {},
  onChange: () => {},
};

interface ObiEditorProps {
  path: string;
  // Obi raw json
  data: any;
  isRoot: boolean;
  onSelect: (id: string) => any;
  onExpand: (id: string) => any;
  onOpen: (calleeDialog: string, callerId: string) => any;
  onChange: (newDialog: any) => any;
}
