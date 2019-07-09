import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import ReactDOM from 'react-dom';

const AlertDialog = props => {
  const { setting, onCancel, onConfirm } = props;
  const { title, subTitle, confirmBtnText } = setting;
  if (!title) {
    throw new Error('confirm modal must give a title');
  }

  return (
    <Dialog
      hidden={false}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        // subText: subTitle,
      }}
      modalProps={{
        isBlocking: true,
        styles: {
          main: { maxWidth: 450 },
        },
      }}
    >
      {subTitle && (
        <div
          style={{
            background: '#000',
            color: '#fff',
            padding: '15px',
            marginBottom: '20px',
          }}
        >
          {subTitle}
        </div>
      )}

      <DialogFooter>
        <PrimaryButton onClick={onConfirm} text={confirmBtnText || 'Ok'} />
      </DialogFooter>
    </Dialog>
  );
};

export const OpenAlertModal = (title, subTitle) => {
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

    const modal = <AlertDialog setting={{ title, subTitle }} onConfirm={onConfirm} onCancel={onCancel} />;
    ReactDOM.render(modal, node);
  });
};
