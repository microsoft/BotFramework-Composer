// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { PropTypes } from 'prop-types';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import ReactDOM from 'react-dom';

import { DialogStyle, BuiltInStyles } from './styles';

const AlertDialog = props => {
  const { setting, onCancel, onConfirm } = props;
  const { title, subTitle = '', confirmBtnText = 'Ok', style = DialogStyle.normalStyle } = setting;
  if (!title) {
    throw new Error('confirm modal must give a title');
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: title
        // subText: subTitle,
      }}
      hidden={false}
      minWidth={500}
      modalProps={{
        isBlocking: true,
        styles: {
          main: { maxWidth: 450 }
        }
      }}
      onDismiss={onCancel}
    >
      {subTitle && <div style={BuiltInStyles[style]}>{subTitle}</div>}

      <DialogFooter>
        <PrimaryButton text={confirmBtnText} onClick={onConfirm} />
      </DialogFooter>
    </Dialog>
  );
};

AlertDialog.propTypes = {
  setting: PropTypes.object,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
};

export const OpenAlertModal = (title, subTitle, setting = {}) => {
  return new Promise(resolve => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const removeNode = () => {
      ReactDOM.unmountComponentAtNode(node);
    };

    const onConfirm = () => {
      removeNode();
      resolve(true);
    };
    const onCancel = () => {
      removeNode();
      resolve(false);
    };

    const modal = <AlertDialog setting={{ title, subTitle, ...setting }} onCancel={onCancel} onConfirm={onConfirm} />;
    ReactDOM.render(modal, node);
  });
};
