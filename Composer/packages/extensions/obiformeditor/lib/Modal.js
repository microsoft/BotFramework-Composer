// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Modal as FabricModal } from 'office-ui-fabric-react/lib/Modal';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
var Modal = function(props) {
  var children = props.children,
    isOpen = props.isOpen,
    onDismiss = props.onDismiss;
  return React.createElement(
    FabricModal,
    { isOpen: isOpen, onDismiss: onDismiss, styles: { main: { maxWidth: '500px', width: '100%' } } },
    React.createElement(
      'div',
      { style: { padding: '30px' } },
      React.createElement(
        'div',
        { style: { position: 'absolute', top: 10, right: 10 } },
        React.createElement(IconButton, {
          iconProps: { iconName: 'ChromeClose' },
          title: formatMessage('Cancel'),
          ariaLabel: formatMessage('Cancel'),
          onClick: onDismiss,
        })
      ),
      React.createElement('div', null, children)
    )
  );
};
Modal.defaultProps = {
  isOpen: true,
  onDismiss: function() {},
};
export default Modal;
//# sourceMappingURL=Modal.js.map
