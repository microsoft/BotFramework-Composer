import React from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { ObiTypes } from '../shared/ObiTypes';
import { deleteNode, insert } from '../shared/jsonTracker';
import DragScroll from '../components/DragScroll';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';
import './ObiEditor.css';
import { LgTemplate } from '../components/shared/sharedProps';

export const ObiEditor: React.FC<ObiEditorProps> = ({
  path,
  focusedId,
  data,
  onSelect,
  onExpand,
  onOpen,
  onChange,
  getLgTemplates,
  removeLgTemplate,
  isRoot,
}) => {
  let divRef;

  const dispatchEvent = (eventName?, eventData?) => {
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
          onChange(deleteNode(data, e.id, removeLgTemplate));
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
      tabIndex={0}
      className="obi-editor-container"
      data-testid="obi-editor-container"
      style={{ width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box' }}
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
          focusedId={focusedId}
          isRoot={isRoot}
          getLgTemplates={getLgTemplates}
          onEvent={(...args) => {
            divRef.focus();
            dispatchEvent(...args);
          }}
        />
      </DragScroll>
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

interface ObiEditorProps {
  path: string;
  focusedId: string;
  // Obi raw json
  data: any;
  isRoot: boolean;
  onSelect: Function;
  onExpand: Function;
  onOpen: Function;
  onChange: Function;
  getLgTemplates: (id: string, templateName: string) => Promise<LgTemplate[]>;
  removeLgTemplate: Function;
}
