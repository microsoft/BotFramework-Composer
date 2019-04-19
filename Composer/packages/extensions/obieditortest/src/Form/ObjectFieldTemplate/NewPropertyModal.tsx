import React, { useState, FormEvent } from 'react';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';

import Modal from '../../Modal';

const NAME_PATTERN = /^\S+$/;

function validateName(name?: string): string | null {
  if (!name || name.trim().length === 0) {
    return formatMessage("Name can't be blank");
  }

  if (!NAME_PATTERN.test(name)) {
    return formatMessage("Name can't contain any spaces");
  }

  return null;
}

interface NewPropertyModalProps {
  name: string;
  onDismiss: () => void;
  onSubmit: (name: string, value: string) => void;
  schema: JSONSchema6;
  value: any;
}

interface NewPropertyFormState {
  name: string;
  value: string;
  errors: {
    name?: string;
  };
}
type formUpdater<T = HTMLInputElement | HTMLTextAreaElement> = (
  field: string
) => (e: FormEvent<T>, newValue?: string) => void;

const NewPropertyModal: React.FunctionComponent<NewPropertyModalProps> = props => {
  const { onDismiss, onSubmit, name, value, schema } = props;
  const [formData, setFormData] = useState<NewPropertyFormState>({ name, value, errors: {} });

  const updateForm: formUpdater = field => (_, newValue): void => {
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

  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
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
};

NewPropertyModal.defaultProps = {
  onDismiss: () => {},
  onSubmit: () => {},
};

export default NewPropertyModal;
