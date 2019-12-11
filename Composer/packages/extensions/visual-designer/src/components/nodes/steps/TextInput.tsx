// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import formatMessage from 'format-message';
import { DialogGroup } from '@bfc/shared';

import { NodeColors } from '../../../constants/ElementColors';
import { NodeEventTypes } from '../types/NodeEventTypes';
import { textInputLayouter } from '../../../layouters/textInputLayouter';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../types/nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Diamond } from '../templates/Diamond';
import { Edge } from '../../lib/EdgeComponents';
import { useLgTemplate } from '../../../utils/hooks';

export const TextInput: FC<NodeProps> = ({ id, data, onEvent, renderers: { NodeMenu } }): JSX.Element => {
  const layout = textInputLayouter(id);
  const { boundary, nodeMap, edges } = layout;
  const { initPrompt, propertyBox, unrecognizedPrompt, invalidPrompt, diamond1, diamond2 } = nodeMap;
  const templateText = useLgTemplate(data.prompt, data.$designer && data.$designer.id);

  return (
    <div className="Action-TextInput" css={{ width: boundary.width, height: boundary.height }}>
      <OffsetContainer offset={initPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Text Input')}
          corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
          icon={ElementIcon.MessageBot}
          label={templateText || '<initPrompt>'}
          onClick={() => {
            onEvent(id, NodeEventTypes.ClickNode);
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={propertyBox.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.INPUT]}
          header={formatMessage('Property')}
          icon={ElementIcon.User}
          label={data.property || '<property>'}
          onClick={() => {
            onEvent(id, NodeEventTypes.ClickNode);
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={unrecognizedPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Unrecognized prompt')}
          icon={ElementIcon.MessageBot}
          label={data.unrecognizedPrompt || '<unrecognizedPrompt>'}
          onClick={() => {
            onEvent(id, NodeEventTypes.ClickNode);
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={invalidPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Invalid prompt')}
          icon={ElementIcon.MessageBot}
          label={data.invalidPrompt || '<invalidPrompt>'}
          onClick={() => {
            onEvent(id, NodeEventTypes.ClickNode);
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={diamond1.offset}>
        <Diamond color={'#C4C4C4'} />
      </OffsetContainer>
      <OffsetContainer offset={diamond2.offset}>
        <Diamond color={'#C4C4C4'} />
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
