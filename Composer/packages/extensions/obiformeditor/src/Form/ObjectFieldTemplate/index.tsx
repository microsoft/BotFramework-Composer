import React, { useState } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { getUiOptions } from '@bfcomposer/react-jsonschema-form/lib/utils';
import get from 'lodash.get';
import omit from 'lodash.omit';
import { ObjectFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';

import ObjectItem from './ObjectItem';
import NewPropertyModal from './NewPropertyModal';

import './styles.css';

function canExpand({ formData, schema, uiSchema }: ObjectFieldTemplateProps): boolean {
  if (!schema.additionalProperties) {
    return false;
  }
  const { expandable } = getUiOptions(uiSchema);
  if (expandable === false) {
    return expandable;
  }
  // if ui:options.expandable was not explicitly set to false, we can add
  // another property if we have not exceeded maxProperties yet
  if (schema.maxProperties !== undefined) {
    return Object.keys(formData).length < schema.maxProperties;
  }
  return true;
}

const ObjectFieldTemplate: React.FunctionComponent<ObjectFieldTemplateProps> = props => {
  const { uiSchema } = props;
  const [showModal, setShowModal] = useState(false);
  const [editableProperty, setEditableProperty] = useState('');

  const handlePropertyEdit = (newName: string, newValue: string): void => {
    props.onChange({
      ...omit(props.formData, editableProperty),
      [newName]: newValue || get(props.formData, newName || editableProperty, ''),
    });
    setShowModal(false);
    setEditableProperty('');
  };

  const onEditProperty = (propName: string): void => {
    setEditableProperty(propName);
    setShowModal(true);
  };

  const onDismiss = (): void => {
    setEditableProperty('');
    setShowModal(false);
  };

  const isHidden = (property: string) => {
    return uiSchema['ui:hidden'] && Array.isArray(uiSchema['ui:hidden']) && uiSchema['ui:hidden'].includes(property);
  };

  return (
    <div className="ObjectFieldTemplate" key={props.idSchema.__id}>
      <BaseField {...props}>
        {props.properties
          .filter(p => !isHidden(p.name))
          .map(p => (
            <ObjectItem {...p} key={p.name} onEdit={() => onEditProperty(p.name)} onAdd={() => setShowModal(true)} />
          ))}
        {canExpand(props) && (
          <>
            <PrimaryButton type="button" onClick={() => setShowModal(true)} styles={{ root: { marginTop: '10px' } }}>
              {formatMessage('Add')}
            </PrimaryButton>
            {showModal && (
              <NewPropertyModal
                onSubmit={handlePropertyEdit}
                onDismiss={onDismiss}
                name={editableProperty}
                schema={props.schema || {}}
              />
            )}
          </>
        )}
      </BaseField>
    </div>
  );
};

export default ObjectFieldTemplate;
