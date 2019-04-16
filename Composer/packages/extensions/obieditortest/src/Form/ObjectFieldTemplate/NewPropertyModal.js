import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import Modal from '../../Modal';

const NAME_PATTERN = /^\S+$/;

function validateName(name) {
  if (!name || name.trim().length === 0) {
    return formatMessage("Name can't be blank");
  }

  if (!NAME_PATTERN.test(name)) {
    return formatMessage("Name can't contain any spaces");
  }

  return null;
}

export default function NewPropertyModal(props) {
  const { onDismiss, onSubmit, name, value, schema } = props;
  const [formData, setFormData] = useState({ name, value, errors: {} });

  const updateForm = field => (e, newValue) => {
    setFormData({ ...formData, errors: {}, [field]: newValue });
  };

  const handleSubmit = e => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    if (nameError) {
      setFormData({ ...formData, errors: { name: nameError } });
      return;
    }

    onSubmit(formData.name, formData.value || '');
  };

  let placeholderText = '';

  if ((schema.examples || []).length > 0) {
    placeholderText = `ex. ${schema.examples.join(', ')}`;
  }

  return (
    <Modal onDismiss={onDismiss}>
      <form onSubmit={handleSubmit}>
        <TextField
          label={formatMessage('Name')}
          onChange={updateForm('name')}
          required
          errorMessage={formData.errors.name}
          value={formData.name}
        />
        <TextField
          label={formatMessage('Value')}
          onChange={updateForm('value')}
          errorMessage={formData.errors.value}
          value={formData.value}
          description={schema.description}
          placeholder={placeholderText}
        />
        <PrimaryButton
          onClick={handleSubmit}
          type="submit"
          primary
          styles={{ root: { width: '100%', marginTop: '20px' } }}
        >
          Add
        </PrimaryButton>
      </form>
    </Modal>
  );
}

NewPropertyModal.propTypes = {
  name: PropTypes.string,
  onDismiss: PropTypes.func,
  onSubmit: PropTypes.func,
  schema: PropTypes.object,
  value: PropTypes.any,
};

NewPropertyModal.defaultProps = {
  onDismiss: () => {},
  onSubmit: () => {},
};
