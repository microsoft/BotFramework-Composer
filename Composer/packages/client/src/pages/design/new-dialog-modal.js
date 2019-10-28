import React, { useState } from 'react';
import { DialogFooter, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { DialogCreationCopy } from '../../constants';
import { DialogModal } from '../../CreationFlow/DialogModal/index';
import { DialogWrapper } from '../../components/DialogWrapper/index';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  return errors;
};

export default function NewDialogModal(props) {
  const { isOpen, onDismiss, onSubmit, onGetErrorMessage } = props;
  const [formData, setFormData] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

  const getErrorMessage = text => {
    if (typeof onGetErrorMessage === 'function') {
      const result = onGetErrorMessage(text);
      if (result === '' && disable) {
        setDisable(false);
      }

      if (result !== '' && !disable) {
        setDisable(true);
      }

      return result;
    } else {
      return '';
    }
  };

  const onClickCancel = () => {
    setFormData({ errors: {} });
    onDismiss();
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    onSubmit({
      ...formData,
    });
  };
  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onClickCancel} {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}>
      <form onSubmit={handleSubmit}>
        <DialogModal
          onGetErrorMessage={onGetErrorMessage}
          horizontal={false}
          getErrorMessage={getErrorMessage}
          updateForm={updateForm}
          formData={formData}
        />
        <DialogFooter>
          <DefaultButton onClick={onClickCancel} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
}
