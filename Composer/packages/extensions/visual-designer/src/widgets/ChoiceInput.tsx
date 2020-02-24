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
import { ListOverview } from '../components/common/ListOverview';
import { getUserAnswersTitle } from '../components/nodes/utils';
import { ChoiceInputSize, ChoiceInputMarginTop } from '../constants/ElementSizes';
import { BorderedDiv } from '../components/elements/styledComponents';

export const ChoiceInputChoices = ({ choices }) => {
  if (!Array.isArray(choices)) {
    return null;
  }
  const itemRender = ({ children }) => (
    <BorderedDiv
      role="choice"
      css={{
        height: ChoiceInputSize.height,
        width: ChoiceInputSize.width,
        marginTop: ChoiceInputMarginTop,
      }}
    >
      {children}
    </BorderedDiv>
  );
  return (
    <div data-testid="ChoiceInput" css={{ padding: '0 0 16px 8px' }}>
      <ListOverview
        items={choices.map(choice => choice.value)}
        ItemRender={itemRender}
        maxCount={3}
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
  const children = <ChoiceInputChoices choices={choices} />;

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
