import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from 'react-jsonschema-form';
import { PrimaryButton, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';

import { buildDialogOptions } from '../utils';
import Modal from '../../Modal';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const [showModal, setShowModal] = useState(false);
  const [newRecognizer, setNewRecognizer] = useState<string | null>(null);
  const { formData, registry } = props;
  const isNew = !formData;

  if (isNew) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      props.onChange({ $type: newRecognizer });
      setShowModal(false);
    };

    const handleAdd = () => {
      console.log('Added item');
      return false;
    };

    const label = formatMessage('Add Recognizer');

    return (
      <div>
        <PrimaryButton onClick={() => setShowModal(true)}>{label}</PrimaryButton>
        <Modal isOpen={showModal} onDismiss={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <Dropdown
              label={formatMessage('Recognizer Type')}
              options={buildDialogOptions(handleAdd, elem => elem.includes('Recognizer')) as IDropdownOption[]}
              onChange={(_, option) => {
                if (option) {
                  setNewRecognizer(option.text);
                }
              }}
            />
            <PrimaryButton type="submit" styles={{ root: { width: '100%', marginTop: '20px' } }}>
              {label}
            </PrimaryButton>
          </form>
        </Modal>
      </div>
    );
  }

  const {
    fields: { ObjectField },
  } = registry;

  const recognizerSchema = (props.schema.oneOf as JSONSchema6[]).find(s => s.title === formData.$type);
  return <ObjectField {...props} schema={recognizerSchema as JSONSchema6} />;
};
