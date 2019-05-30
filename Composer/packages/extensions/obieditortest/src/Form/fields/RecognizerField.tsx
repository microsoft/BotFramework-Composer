import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { PrimaryButton, IDropdownOption, IContextualMenuItem } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';
import { DefaultButton } from 'office-ui-fabric-react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

import { buildDialogOptions } from '../utils';
import Modal from '../../Modal';
import { DialogGroup } from '../../schema/appschema';

import './styles.scss';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const [showModal, setShowModal] = useState(false);
  const [newRecognizer, setNewRecognizer] = useState<string | undefined>(undefined);
  const { formData, registry } = props;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setShowModal(false);
    if (!formData || formData.$type !== newRecognizer) {
      props.onChange({ $type: newRecognizer });
    }
  };

  const newLabel = formatMessage('Add Language Understanding');

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'edit',
      text: formatMessage('Change Language Understanding'),
      iconProps: { iconName: 'Edit' },
      onClick: () => {
        setNewRecognizer(formData.$type);
        setShowModal(true);
      },
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      onClick: () => {
        props.onChange(undefined);
      },
    },
  ];

  const {
    fields: { ObjectField },
  } = registry;

  const recognizerSchema = formData ? (props.schema.oneOf as JSONSchema6[]).find(s => s.title === formData.$type) : {};
  console.log('r', recognizerSchema, props);
  return (
    <div className="RecognizerField">
      {formData && (
        <>
          <ObjectField
            {...props}
            formData={{ $type: 'Language Understanding' }}
            schema={recognizerSchema as JSONSchema6}
          />
          <div className="RecognizerFieldMenu">
            <DefaultButton menuProps={{ items: menuItems }} />
          </div>
        </>
      )}
      {!formData && <PrimaryButton onClick={() => setShowModal(true)}>{newLabel}</PrimaryButton>}
      {showModal && (
        <Modal onDismiss={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <Dropdown
              label={formatMessage('Recognizer Type')}
              options={
                buildDialogOptions({
                  include: [DialogGroup.RECOGNIZER],
                  asDropdown: true,
                }) as IDropdownOption[]
              }
              selectedKey={newRecognizer}
              responsiveMode={ResponsiveMode.large}
              onChange={(_, option) => {
                if (option) {
                  setNewRecognizer(option.text);
                }
              }}
              componentRef={ref => {
                if (ref) {
                  ref.focus();
                }
              }}
            />
            <PrimaryButton type="submit" styles={{ root: { width: '100%', marginTop: '20px' } }}>
              {newLabel}
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
};
