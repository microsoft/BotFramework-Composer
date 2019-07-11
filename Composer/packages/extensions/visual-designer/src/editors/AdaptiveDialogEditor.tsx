// eslint-disable-next-line no-unused-vars
import React, { useMemo, FunctionComponent } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { Collapse } from '../components/nodes/templates/Collapse';

import { StepEditor } from './StepEditor';
import { EventsEditor } from './EventsEditor';

const calculateNodeMap = (_, data) => {
  const { ruleGroup, stepGroup } = transformRootDialog(data);
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor: FunctionComponent<NodeProps> = ({
  id,
  data,
  focusedId,
  getLgTemplates,
  onEvent,
}): JSX.Element => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {ruleGroup ? (
        <EventsEditor
          key={ruleGroup.id}
          id={ruleGroup.id}
          data={ruleGroup.data}
          focusedId={focusedId}
          getLgTemplates={getLgTemplates}
          onEvent={onEvent}
        />
      ) : null}
      <div style={{ height: 50 }} />
      {stepGroup ? (
        <Collapse text="Actions">
          <StepEditor
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            getLgTemplates={getLgTemplates}
            onEvent={onEvent}
          />
        </Collapse>
      ) : null}
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = defaultNodeProps;
