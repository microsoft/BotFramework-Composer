import React, { useMemo } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeClickActionTypes } from '../shared/NodeClickActionTypes';

import { NodeProps, defaultNodeProps } from './shared/sharedProps';
import { GraphObjectModel } from './shared/GraphObjectModel';
import { RecognizerGroup, StepGroup } from './groups';

const ColMargin = 10;

const calculateNodeMap = (_, data) => {
  const { recognizerGroup, ruleGroup, stepGroup } = transformRootDialog(data);
  return {
    dialog: GraphObjectModel.fromIndexedJson(recognizerGroup),
    ruleGroup: GraphObjectModel.fromIndexedJson(ruleGroup),
    stepGroup: GraphObjectModel.fromIndexedJson(stepGroup),
  };
};

export const RootDialog = ({ id, data, focusedId, onEvent }) => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { dialog, stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        margin: 20,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeClickActionTypes.Focus, '');
      }}
    >
      {dialog ? (
        <div style={{ margin: ColMargin }}>
          <RecognizerGroup key={dialog.id} id={dialog.id} data={dialog.data} focusedId={focusedId} onEvent={onEvent} />
        </div>
      ) : null}
      {stepGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepGroup
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
          />
        </div>
      ) : null}
      {ruleGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepGroup
            key={ruleGroup.id}
            id={ruleGroup.id}
            data={ruleGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
          />
        </div>
      ) : null}
    </div>
  );
};

RootDialog.propTypes = NodeProps;
RootDialog.defaultProps = defaultNodeProps;
