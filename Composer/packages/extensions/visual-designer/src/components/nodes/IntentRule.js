import React from 'react';

import { ObiTypes } from '../../shared/ObiTypes';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { normalizeObiStep } from '../../transformers/helpers/elementBuilder';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { NodeMenu } from './templates/NodeMenu';
import { getFriendlyName } from './utils';

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
        header={getFriendlyName(data) || intent}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={this.getDetails()}
        icon="MessageBot"
        onClick={() => {
          if (Array.isArray(steps) && steps.length) {
            onEvent(NodeEventTypes.Expand, id);
          } else {
            onEvent(NodeEventTypes.Focus, id);
          }
        }}
      />
    );
  }
}

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
