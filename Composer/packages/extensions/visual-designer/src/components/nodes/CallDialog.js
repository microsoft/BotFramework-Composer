import React from 'react';

import { FormCard } from './templates/FormCard';
import { NodeClickActionTypes } from '../../utils/constant';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class CallDialog extends React.Component {
  renderCallDialogLink(data) {
    const calleeDialog = data.dialog && data.dialog.$ref ? data.dialog.$ref : '';
    // TODO: OBI schema no longer uses file path as dialogref. Align with new schema when runtime supports it.
    const regexResult = calleeDialog.match(/.+\/(.+)\.dialog$/);
    const dialogName = regexResult && regexResult[1] ? regexResult[1] : calleeDialog;

    return (
      <span
        style={{
          cursor: 'pointer',
          color: 'blue',
        }}
        onClick={e => {
          e.stopPropagation();
          this.props.onTriggerEvent(NodeClickActionTypes.OpenLink, dialogName);
        }}
      >
        {dialogName}
      </span>
    );
  }

  render() {
    const { id, data, onTriggerEvent } = this.props;
    return (
      <FormCard
        themeColor="#107C10"
        header="CallDialog"
        details={this.renderCallDialogLink(data)}
        onClick={() => {
          if (Array.isArray(steps) && steps.length) {
            onTriggerEvent(NodeClickActionTypes.Focus, id);
          }
        }}
      />
    );
  }
}

CallDialog.propTypes = NodeProps;
CallDialog.defaultProps = defaultNodeProps;
