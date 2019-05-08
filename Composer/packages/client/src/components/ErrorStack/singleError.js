/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
export const SingleError = props => {
  console.log('error upon');
  return (
    <MessageBar
      styles={{
        root: {
          background: 'pink',
        },
      }}
      messageBarType={MessageBarType.error}
      isMultiline={true}
      onDismiss={() => {
        console.log('close error message');
        props.onDismiss();
      }}
      dismissButtonAriaLabel="Close"
    >
      <div>Server Error: {props.message.status}</div>
      {props.message.Message.message}
    </MessageBar>
  );
};
SingleError.propTypes = {
  message: PropTypes.object,
  onDismiss: PropTypes.func,
};
