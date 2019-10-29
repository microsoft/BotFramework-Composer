/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import * as React from 'react';
import { PropTypes } from 'prop-types';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import ReactDOM from 'react-dom';

import { DialogStyle, BuiltInStyles, dialog, dialogModal } from './styles';

const ConfirmDialog = props => {
  const { setting, onCancel, onConfirm } = props;
  const {
    title,
    subTitle = '',
    onRenderContent = defaultContentRender,
    confirmBtnText = 'Yes',
    cancelBtnText = 'Cancel',
    style = DialogStyle.normalStyle,
  } = setting;
  if (!title) {
    throw new Error('confirm modal must give a title');
  }

  function defaultContentRender() {
    return <div style={BuiltInStyles[style]}> {subTitle} </div>;
  }

  return (
    <Dialog
      hidden={false}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        styles: dialog,
      }}
      modalProps={{
        isBlocking: true,
        styles: dialogModal,
      }}
    >
      {onRenderContent(subTitle, BuiltInStyles[style])}
      <DialogFooter>
        <PrimaryButton onClick={onConfirm} text={confirmBtnText} />
        <DefaultButton onClick={onCancel} text={cancelBtnText} />
      </DialogFooter>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  setting: PropTypes.object,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export const OpenConfirmModal = (title, subTitle, setting = {}) => {
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

    const modal = <ConfirmDialog setting={{ title, subTitle, ...setting }} onConfirm={onConfirm} onCancel={onCancel} />;
    ReactDOM.render(modal, node);
  });
};
