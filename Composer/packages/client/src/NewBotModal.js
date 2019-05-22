/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { Modal, TextField, Button, Label } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import {
  newContainer,
  newBotModal,
  newModalTitle,
  templateList,
  templateItem,
  actionWrap,
  newModalForm,
} from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = 'must only use letters, numbers, -, and _';
  }

  return errors;
};

export default function NewBotModal(props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isOpen, onDismiss, templates, onSubmit, defaultLocation } = props;
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

    onSubmit({ ...formData, ...defaultLocation, templateId: templates[selectedIndex].id });
    onDismiss();
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} styles={newBotModal}>
      <div css={newContainer}>
        <div css={newModalTitle}>{formatMessage('Create new')}</div>
        <form onSubmit={handleSubmit} css={newModalForm}>
          <TextField
            label={formatMessage('Name:')}
            required
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
          />
          <TextField disabled label={formatMessage('Location:')} value={defaultLocation.path || ''} />
          <div>
            <Label>Template:</Label>
            <ul css={templateList}>
              {templates.map((item, index) => {
                return (
                  <li css={templateItem(index === selectedIndex)} key={item.id} onClick={() => setSelectedIndex(index)}>
                    {item.name}
                  </li>
                );
              })}
            </ul>
          </div>
          <div css={actionWrap}>
            <Button styles={{ root: { marginRight: '20px' } }} onClick={onDismiss}>
              {formatMessage('Cancel')}
            </Button>
            <Button primary onClick={handleSubmit}>
              {formatMessage('Create')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
