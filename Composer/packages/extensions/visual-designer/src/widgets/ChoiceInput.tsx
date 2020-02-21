// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { DialogGroup, PromptTab } from '@bfc/shared';

import { ChoiceInputSize, ChoiceInputMarginTop } from '../constants/ElementSizes';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { NodeColors } from '../constants/ElementColors';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { FormCard } from '../components/nodes/templates/FormCard';
import { NodeProps } from '../components/nodes/nodeProps';
import { BorderedDiv, MultiLineDiv } from '../components/elements/styledComponents';
import { getUserAnswersTitle } from '../components/nodes/utils';

export const ChoiceInputChoices = ({ choices }) => {
  if (!Array.isArray(choices)) {
    return null;
  }

  return (
    <div data-testid="ChoiceInput" css={{ padding: '0 0 16px 8px' }}>
      {choices.map(({ value }, index) => {
        if (index < 3) {
          return (
            <BorderedDiv key={index} role="choice" title={typeof value === 'string' ? value : ''}>
              {value}
            </BorderedDiv>
          );
        }
      })}
      {Array.isArray(choices) && choices.length > 3 ? (
        <MultiLineDiv
          data-testid="hasMore"
          css={{
            height: ChoiceInputSize.height,
            width: ChoiceInputSize.width,
            marginTop: ChoiceInputMarginTop,
            textAlign: 'center',
          }}
        >
          {`${choices.length - 3} more`}
        </MultiLineDiv>
      ) : null}
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
