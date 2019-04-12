import React from 'react';

import { ObiTypes } from '../../transformers/constants/ObiTypes';
import { NodeClickActionTypes } from '../../utils/constant';
import { normalizeObiStep } from '../../transformers/helpers/elementBuilder';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class IntentRule extends React.Component {
  getDetails() {
    const { steps } = this.props.data;
    if (Array.isArray(steps) && steps.length === 1) {
      const normalizedStep = normalizeObiStep(steps[0]);
      if (normalizedStep.$type === ObiTypes.BeginDialog) {
        return (
          <span
            style={{
              cursor: 'pointer',
              color: 'blue',
              marginLeft: 5,
            }}
            onClick={e => {
              e.stopPropagation();
              this.props.onEvent(NodeClickActionTypes.OpenLink, normalizedStep.dialog);
            }}
          >
            {normalizedStep.dialog}
          </span>
        );
      }
    }
    return 'Task';
  }

  render() {
    const { id, data, onEvent } = this.props;
    const { intent, steps } = data;
    return (
      <FormCard
        themeColor="#0078D4"
        header={intent}
        label={this.getDetails()}
        icon="MessageBot"
        onClick={() => {
          if (Array.isArray(steps) && steps.length) {
            onEvent(NodeClickActionTypes.Expand, id);
          } else {
            onEvent(NodeClickActionTypes.Focus, id);
          }
        }}
      />
    );
  }
}

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
