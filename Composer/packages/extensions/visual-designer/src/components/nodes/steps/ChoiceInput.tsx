/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { DialogGroup } from 'shared-menus';

import { ChoiceInputSize, ChoiceInputMarginTop } from '../../../constants/ElementSizes';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { ObiTypes } from '../../../constants/ObiTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { measureJsonBoundary } from '../../../layouters/measureJsonBoundary';
import { FormCard } from '../templates/FormCard';
import { getFriendlyName } from '../utils';
import { NodeProps, defaultNodeProps } from '../nodeProps';

const truncateType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');
export class ChoiceInput extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  render() {
    const { id, data, onEvent } = this.props;
    let header = getFriendlyName(data),
      label = '';

    const keyMap: { [key: string]: string } = { label: 'property', details: 'property' };
    const choices = data.choices;
    let children: any = null;
    const { height } = measureJsonBoundary(data);
    const styles = { height };

    if (keyMap) {
      header = header || keyMap.header || '';
      label = data[keyMap.label] || label;
    }

    if (!header) {
      header = truncateType(data.$type);
    }

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
        header={header}
        icon={'User'}
        label={label}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, id);
        }}
        styles={styles}
      >
        {children}
      </FormCard>
    );
  }
}
