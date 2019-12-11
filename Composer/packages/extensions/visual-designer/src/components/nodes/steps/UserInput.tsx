// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { DialogGroup } from '@bfc/shared';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../types/nodeProps';
import { ObiTypes } from '../../../constants/ObiTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { getUserAnswersTitle } from '../../../utils/adaptive-utils';

import { ChoiceInput } from './ChoiceInput';

export const UserInput: FC<NodeProps> = ({ id, data, onEvent, onResize, renderers }): JSX.Element => {
  if (data.$type === ObiTypes.ChoiceInputDetail) {
    return <ChoiceInput id={id} data={data} onEvent={onEvent} onResize={onResize} renderers={renderers} />;
  }

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      icon={ElementIcon.User}
      header={getUserAnswersTitle(data._type)}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(id, NodeEventTypes.ClickNode);
      }}
    />
  );
};
