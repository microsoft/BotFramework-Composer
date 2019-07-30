/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, FC } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { ObiTypes } from '../shared/ObiTypes';
import { deleteNode, insert } from '../shared/jsonTracker';
import DragScroll from '../components/DragScroll';
import { NodeRendererContext } from '../store/NodeRendererContext';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';
import './ObiEditor.css';

export const ObiEditor: FC<ObiEditorProps> = ({ path, data, onSelect, onExpand, onOpen, onChange, isRoot }) => {
  let divRef;

  const { focusedId, removeLgTemplate } = useContext(NodeRendererContext);

  const dispatchEvent = (eventName?, eventData?, ...rest): any => {
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
      default:
        handler = onSelect;
        break;
    }
    return handler(eventData, rest);
  };

  const chooseEditor = ($type: string): FC<any> => {
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
      tabIndex={0}
      className="obi-editor-container"
      data-testid="obi-editor-container"
      css={{ width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box' }}
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
        <ChosenEditor
          id={path}
          data={data}
          hideSteps={isRoot}
          onEvent={(...args) => {
            divRef.focus({ preventScroll: true });
            dispatchEvent(...args);
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
  onSelect: Function;
  onExpand: Function;
  onOpen: Function;
  onChange: Function;
}
