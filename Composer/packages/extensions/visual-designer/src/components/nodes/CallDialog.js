import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class CallDialog extends React.Component {
  renderCallDialogLink() {
    const { data, onEvent } = this.props;

    const calleeDialog = data.dialog && data.dialog.$ref ? data.dialog.$ref : '';
    // TODO: OBI schema no longer uses file path as dialogref. Align with new schema when runtime supports it.
    const regexResult = calleeDialog.match(/.+[/\\](.+)\.dialog$/);
    const dialogName = regexResult && regexResult[1] ? regexResult[1] : calleeDialog;

    return (
      <span
        style={{
          cursor: 'pointer',
          color: 'blue',
        }}
        onClick={e => {
          e.stopPropagation();
          onEvent(NodeClickActionTypes.OpenLink, dialogName);
        }}
      >
        {dialogName}
      </span>
    );
  }

  render() {
    const { id, onEvent } = this.props;
    return (
      <FormCard
        themeColor="#107C10"
        header="CallDialog"
        details={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

CallDialog.propTypes = NodeProps;
CallDialog.defaultProps = defaultNodeProps;
