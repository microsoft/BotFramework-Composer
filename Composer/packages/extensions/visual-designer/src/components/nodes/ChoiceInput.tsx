import React from 'react';

import { InitNodeSize, ChoiceInputSize, ChoiceInputMarginTop } from '../../shared/elementSizes';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeMenu } from '../shared/NodeMenu';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { getDialogGroupByType } from '../../shared/appschema';
import { getElementColor } from '../../shared/elementColors';
import { ObiTypes } from '../../shared/ObiTypes';

import { getFriendlyName } from './utils';
import { FormCard } from './templates/FormCard';

const truncateType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');
export class ChoiceInput extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  render() {
    const { id, data, onEvent } = this.props;
    let header = getFriendlyName(data),
      label = '';

    const keyMap: { [key: string]: string } = { label: 'prompt', details: 'property' };
    const dialogGroup = getDialogGroupByType(data.$type);
    const nodeColors = getElementColor(dialogGroup);
    const icon = dialogGroup === 'INPUT' ? 'User' : 'MessageBot';
    const choices = data.$type === ObiTypes.ChoiceInput && data.choices ? data.choices : null;
    let children: any = null;
    let styles: object = {};

    if (keyMap) {
      header = header || keyMap.header || '';
      label = data[keyMap.label] || label;
    }

    if (!header) {
      header = truncateType(data.$type);
    }

    if (choices) {
      children = (
        <div data-testid="ChoiceInput" style={{ padding: '0 0 8px 45px' }}>
          {choices.map((choice, index) => {
            if (index < 3) {
              return (
                <div
                  key={index}
                  role="choice"
                  style={{
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
              style={{
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
      styles = { height: InitNodeSize.height + (ChoiceInputSize.height + ChoiceInputMarginTop) * choices.length + 8 };
    }
    return (
      <FormCard
        nodeColors={nodeColors}
        header={header}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        icon={icon}
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
