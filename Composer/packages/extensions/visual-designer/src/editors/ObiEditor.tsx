/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, FC } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { deleteNode, insert } from '../shared/jsonTracker';
import DragScroll from '../components/DragScroll';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { SelectableGroup } from '../components/nodes/dragSelection/index';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export const ObiEditor: FC<ObiEditorProps> = ({ path, data, onFocusEvent, onFocusSteps, onOpen, onChange }) => {
  let divRef;

  const { focusedId, removeLgTemplate } = useContext(NodeRendererContext);

  const dispatchEvent = (eventName: NodeEventTypes, eventData: any): any => {
    let handler;
    switch (eventName) {
      case NodeEventTypes.Focus:
        handler = id => onFocusSteps(id ? [id] : []);
        break;
      case NodeEventTypes.FocusEvent:
        handler = onFocusEvent;
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
          onFocusSteps([]);
        };
        break;
      case NodeEventTypes.Insert:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onFocusSteps([`${e.id}[${e.position || 0}]`]);
        };
        break;
      case NodeEventTypes.InsertEvent:
        handler = e => {
          const dialog = insert(data, e.id, e.position, e.$type);
          onChange(dialog);
          onFocusEvent(`${e.id}[${e.position || 0}]`);
        };
        break;
      default:
        handler = onFocusSteps;
        break;
    }
    return handler(eventData);
  };

  const renderFallbackContent = () => {
    return null;
  };

  const handleSelectionChange = items => {
    const itemIds: string[] = [];
    let shortestLength = 999;

    items.forEach(item => {
      if (item && item.dataset['selectionid'] && item.dataset['selectionid'].length < shortestLength) {
        shortestLength = item.dataset['selectionid'].length;
      }
      item && itemIds.push(item.dataset['selectionid']);
    });

    const seletectItemIds = new Set<string>(itemIds.map(item => (item = item.substr(0, shortestLength))));
    console.log('selected items:' + Array.from(seletectItemIds));
  };

  if (!data) return renderFallbackContent();

  return (
    <div
      tabIndex={0}
      className="obi-editor-container"
      data-testid="obi-editor-container"
      css={{
        width: '100%',
        height: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        '&:focus': { outline: 'none' },
      }}
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
        <SelectableGroup onSelectionChange={handleSelectionChange}>
          <AdaptiveDialogEditor
            id={path}
            data={data}
            onEvent={(eventName, eventData) => {
              divRef.focus({ preventScroll: true });
              dispatchEvent(eventName, eventData);
            }}
          />
        </SelectableGroup>
      </DragScroll>
    </div>
  );
};

ObiEditor.defaultProps = {
  path: '.',
  data: {},
  focusedSteps: [],
  onFocusSteps: () => {},
  focusedEvent: '',
  onFocusEvent: () => {},
  onOpen: () => {},
  onChange: () => {},
};

interface ObiEditorProps {
  path: string;
  // Obi raw json
  data: any;
  focusedSteps: string[];
  onFocusSteps: (stepIds: string[]) => any;
  focusedEvent: string;
  onFocusEvent: (eventId: string) => any;
  onOpen: (calleeDialog: string, callerId: string) => any;
  onChange: (newDialog: any) => any;
}
