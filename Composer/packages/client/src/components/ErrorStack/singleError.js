/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { useEffect } from 'react';
export const SingleError = props => {
  useEffect(() => {
    const timerID = setInterval(() => {
      props.onDismiss(); //close component 5s later
    }, 5000);
    return function cleanUpTimer() {
      clearInterval(timerID);
    };
  });
  return (
    <MessageBar
      styles={{
        root: {
          background: 'pink',
          borderBottomColor: 'deeppink',
          borderWidth: '1px',
          borderBottomStyle: 'solid',
        },
      }}
      messageBarType={MessageBarType.error}
      isMultiline={true}
      onDismiss={() => {
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
