// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { DialogGroup, PromptTab } from '@bfc/shared';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { NodeColors } from '../constants/ElementColors';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { FormCard } from '../components/nodes/templates/FormCard';
import { NodeProps } from '../components/nodes/nodeProps';
import { ListOverview } from '../components/common/ListOverView';
import { getUserAnswersTitle } from '../components/nodes/utils';
import { ChoiceInputSize, ChoiceInputMarginTop } from '../constants/ElementSizes';
import { UI_ELEMENT_KEY } from '../components/elements/styledComponents.types';
import { BorderedDiv } from '../components/elements/styledComponents';

export const ChoiceInputChoices = ({ choices, elementSchema }) => {
  if (!Array.isArray(choices)) {
    return null;
  }

  return (
    <div data-testid="ChoiceInput" css={{ padding: '0 0 16px 8px' }}>
      <ListOverview
        items={choices.map(choice => choice.value)}
        elementSchema={elementSchema}
        maxCount={3}
        role="choice"
        styles={{
          height: ChoiceInputSize.height,
          width: ChoiceInputSize.width,
          marginTop: ChoiceInputMarginTop,
        }}
      />
    </div>
  );
};

export const ChoiceInput: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const boundary = measureJsonBoundary(data);
  const { choices } = data;
  const elementSchema = {
    [UI_ELEMENT_KEY]: BorderedDiv,
  };
  const children = <ChoiceInputChoices choices={choices} elementSchema={elementSchema} />;

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      header={getUserAnswersTitle(data._type)}
      icon={ElementIcon.User}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.USER_INPUT });
      }}
      styles={{ width: boundary.width, height: boundary.height }}
    >
      {children}
    </FormCard>
  );
};
