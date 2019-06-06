import React from 'react';

import { ObiTypes } from '../../shared/ObiTypes';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { normalizeObiStep } from '../../transformers/helpers/elementBuilder';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { IconCard } from './templates/IconCard';

export class IntentRule extends React.Component {
  getDetails() {
    const { intent, steps } = this.props.data;
    if (Array.isArray(steps) && steps.length === 1) {
      const normalizedStep = normalizeObiStep(steps[0]);
      if (normalizedStep.$type === ObiTypes.BeginDialog) {
        return (
          <span
            style={{
              cursor: 'pointer',
            }}
            onClick={e => {
              e.stopPropagation();
              this.props.onEvent(NodeEventTypes.OpenLink, normalizedStep.dialog);
            }}
          >
            {normalizedStep.dialog}
          </span>
        );
      }
    }
    return intent;
  }

  render() {
    const { id, focusedId, onEvent } = this.props;
    return (
      <IconCard
        themeColor="#BFEAE9"
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={this.getDetails()}
        icon="MessageBot"
        onClick={() => {
          if (focusedId === id) {
            onEvent(NodeEventTypes.Expand, id);
          } else {
            onEvent(NodeEventTypes.Focus, id);
          }
        }}
        onClickIcon={() => {
          onEvent(NodeEventTypes.Expand, id);
        }}
      />
    );
  }
}

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
