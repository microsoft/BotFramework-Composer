import React, { useState } from 'react';
import { createTheme, PrimaryButton } from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import { getUiOptions } from 'react-jsonschema-form/lib/utils';
import omit from 'lodash.omit';

import ObjectItem from './ObjectItem';
import NewPropertyModal from './NewPropertyModal';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '24px',
    },
  },
});

function canExpand({ formData, schema, uiSchema }) {
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

export default function ObjectFieldTemplate(props) {
  const [showModal, setShowModal] = useState(false);
  const [editableProperty, setEditableProperty] = useState('');

  const handlePropertyEdit = (newName, newValue) => {
    props.onChange({ ...omit(props.formData, editableProperty), [newName]: newValue });
    setShowModal(false);
    setEditableProperty('');
  };

  const onEditProperty = propName => {
    setEditableProperty(propName);
    setShowModal(true);
  };

  const onDismiss = () => {
    setEditableProperty('');
    setShowModal(false);
  };

  return (
    <div>
      {(props.uiSchema['ui:title'] || props.title) && (
        <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
          {props.uiSchema['ui:title'] || props.title}
        </Separator>
      )}
      {props.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.description}</p>
      )}
      {props.properties.map(p => (
        <ObjectItem {...p} key={p.name} onEdit={() => onEditProperty(p.name)} />
      ))}
      {canExpand(props) && (
        <React.Fragment>
          <PrimaryButton
            type="button"
            onClick={() => setShowModal(true)}
            styles={{ root: { marginTop: '10px' } }}
            iconProps={{ iconName: 'Add' }}
          >
            Add
          </PrimaryButton>
          {showModal && (
            <NewPropertyModal
              onSubmit={handlePropertyEdit}
              onDismiss={onDismiss}
              name={editableProperty}
              value={props.formData[editableProperty]}
              schema={props.schema || {}}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
}
