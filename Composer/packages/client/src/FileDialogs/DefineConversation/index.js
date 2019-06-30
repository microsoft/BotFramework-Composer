/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';

import { DialogInfo } from '../../constants';

import { DialogWrapper } from './../../components/DialogWrapper';
import { name, description } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = 'must only use letters, numbers, -, and _';
  }

  return errors;
};

export function DefineConversationDialog(props) {
  const { onDismiss, onSubmit, hidden, onGetErrorMessage } = props;
  const [formData, setFormData] = useState({ errors: {} });

  const updateForm = field => (e, newValue) => {
    setFormData({ ...formData, errors: {}, [field]: newValue });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({ ...formData, errors });
      return;
    }

    onSubmit({ ...formData });
  };

  return (
    <DialogWrapper
      hidden={hidden}
      onDismiss={onDismiss}
      title={DialogInfo.DEFINE_CONVERSATION_OBJECTIVE.title}
      subText={DialogInfo.DEFINE_CONVERSATION_OBJECTIVE.subText}
    >
      <form onSubmit={handleSubmit}>
        <Stack
          tokens={{
            childrenGap: 15,
          }}
        >
          <TextField
            label={formatMessage('Dialog name')}
            styles={name}
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
            onGetErrorMessage={onGetErrorMessage}
            data-testid="NewDialogName"
          />
          <TextField
            styles={description}
            label={formatMessage('Description')}
            multiline
            resizable={false}
            onChange={updateForm('description')}
          />
        </Stack>
        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
}
