/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import formatMessage from 'format-message';
import { DialogGroup } from 'shared-menus';

import { NodeColors } from '../../../constants/ElementColors';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { baseInputLayouter } from '../../../layouters/baseInputLayouter';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { GraphNode } from '../../../models/GraphNode';
import { transformBaseInput } from '../../../transformers/transformBaseInput';
import { IconBrick } from '../../decorations/IconBrick';
import { UserAnswers } from '../steps/UserAnswers';

const calculateNodes = (data, jsonpath: string) => {
  const { botAsks, userAnswers } = transformBaseInput(data, jsonpath);
  return {
    botAsksNode: GraphNode.fromIndexedJson(botAsks),
    userAnswersNode: GraphNode.fromIndexedJson(userAnswers),
  };
};

export const BaseInput: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const nodes = calculateNodes(data, id);
  const layout = baseInputLayouter(nodes.botAsksNode, nodes.userAnswersNode);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, iconNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height }}>
      <OffsetContainer offset={botAsksNode.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Bot Asks')}
          corner={<NodeMenu id={id} onEvent={onEvent} />}
          icon={'MessageBot'}
          label={data.prompt || '<prompt>'}
          onClick={() => {
            onEvent(NodeEventTypes.Focus, id);
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <UserAnswers id={id} data={userAnswersNode.data} onEvent={onEvent} onResize={onResize} />
      </OffsetContainer>
      <OffsetContainer offset={iconNode.offset}>
        <IconBrick onClick={() => {}} />
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
