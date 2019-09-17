/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { DialogGroup } from 'shared-menus';

import { ChoiceInputSize, ChoiceInputMarginTop } from '../../../constants/ElementSizes';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { measureJsonBoundary } from '../../../layouters/measureJsonBoundary';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getUserAnswersTitle } from '../utils';

export const ChoiceInput: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const boundary = measureJsonBoundary(data);
  const choices = data.choices;
  let children: any = null;

  if (choices) {
    children = (
      <div data-testid="ChoiceInput" css={{ padding: '0 0 8px 45px' }}>
        {choices.map((choice, index) => {
          if (index < 3) {
            return (
              <div
                key={index}
                role="choice"
                css={{
                  height: ChoiceInputSize.height,
                  width: ChoiceInputSize.width,
                  marginTop: ChoiceInputMarginTop,
                  paddingLeft: '7px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontFamily: 'Segoe UI',
                  fontSize: '12px',
                  lineHeight: '19px',
                  border: '1px solid #B3B0AD',
                  boxSizing: 'border-box',
                  borderRadius: '2px',
                }}
                title={typeof choice.value === 'string' ? choice.value : ''}
              >
                {choice.value}
              </div>
            );
          }
        })}
        {choices.length > 3 ? (
          <div
            data-testid="hasMore"
            css={{
              height: ChoiceInputSize.height,
              width: ChoiceInputSize.width,
              marginTop: ChoiceInputMarginTop,
              textAlign: 'center',
              fontFamily: 'Segoe UI',
              fontSize: '12px',
              lineHeight: '19px',
              boxSizing: 'border-box',
            }}
          >
            {`${choices.length - 3} more`}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      header={getUserAnswersTitle(data._type)}
      icon={ElementIcon.User}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, id);
      }}
      styles={{ width: boundary.width, height: boundary.height }}
    >
      {children}
    </FormCard>
  );
};
