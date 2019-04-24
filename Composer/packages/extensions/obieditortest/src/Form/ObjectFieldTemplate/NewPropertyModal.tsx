import React, { useState, FormEvent } from 'react';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import get from 'lodash.get';

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
}

interface NewPropertyFormState {
  name?: string;
  error?: string;
}
type formUpdater<T = HTMLInputElement | HTMLTextAreaElement> = (e: FormEvent<T>, newValue?: string) => void;

function getDefaultValue(schema: JSONSchema6): any {
  switch (get(schema, 'additionalProperties.type')) {
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return '';
  }
}

const NewPropertyModal: React.FunctionComponent<NewPropertyModalProps> = props => {
  const { onDismiss, onSubmit, name, schema } = props;
  const [formData, setFormData] = useState<NewPropertyFormState>({ name });

  const updateForm: formUpdater = (_, newValue): void => {
    setFormData({ error: undefined, name: newValue });
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    if (nameError) {
      setFormData({ ...formData, error: nameError });
      return;
    }

    onSubmit(formData.name as string, getDefaultValue(schema));
  };

  return (
    <Modal onDismiss={onDismiss}>
      <form onSubmit={handleSubmit}>
        <TextField
          description={get(schema, 'propertyNames.description')}
          label={get(schema, 'propertyNames.title') || formatMessage('Name')}
          onChange={updateForm}
          required
          errorMessage={formData.error}
          value={formData.name}
        />
        <PrimaryButton type="submit" primary styles={{ root: { width: '100%', marginTop: '20px' } }}>
          {formatMessage('Add')}
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
