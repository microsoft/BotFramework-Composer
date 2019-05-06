import React, { useState, useEffect } from 'react';
import { Modal, IconButton, TextField, Button } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = 'must only use letters, numbers, -, and _';
  }

  return errors;
};

export default function NewLgTemplategModal(props) {
  const { isOpen, onDismiss, onSubmit } = props;
  const [formData, setFormData] = useState({ errors: {} });

  useEffect(() => {
    setFormData({ errors: {} });
  }, [isOpen]);

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
    <Modal isOpen={isOpen} onDismiss={onDismiss} styles={{ main: { maxWidth: '500px', width: '100%' } }}>
      <div style={{ padding: '30px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton
            iconProps={{ iconName: 'ChromeClose' }}
            title={formatMessage('Add LG Template')}
            ariaLabel={formatMessage('Add LG Template')}
            onClick={onDismiss}
          />
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <TextField
              label={formatMessage('LG Template Name')}
              onChange={updateForm('name')}
              required
              errorMessage={formData.errors.name}
              componentRef={ref => {
                if (ref) {
                  ref.focus();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              type="submit"
              primary
              styles={{ root: { width: '100%', marginTop: '20px' } }}
            >
              {formatMessage('Create New LG Template')}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
