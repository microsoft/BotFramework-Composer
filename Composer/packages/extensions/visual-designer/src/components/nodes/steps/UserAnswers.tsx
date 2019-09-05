/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { DialogGroup } from 'shared-menus';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { ObiTypes } from '../../../constants/ObiTypes';
import { NodeColors } from '../../../constants/ElementColors';

import { ChoiceInput } from './ChoiceInput';

export const UserAnswers: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  if (data.$type === ObiTypes.ChoiceInputDetail) {
    return <ChoiceInput id={id} data={data} onEvent={onEvent} onResize={onResize} />;
  }

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      header={'User Answers'}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, id);
      }}
    />
  );
};
