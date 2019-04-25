import React, { useState } from 'react';
import { createTheme, PrimaryButton } from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import { getUiOptions } from 'react-jsonschema-form/lib/utils';
import omit from 'lodash.omit';
import { ObjectFieldTemplateProps } from 'react-jsonschema-form';
import formatMessage from 'format-message';

import ObjectItem from './ObjectItem';
import NewPropertyModal from './NewPropertyModal';

import './styles.scss';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '24px',
    },
  },
  palette: {
    neutralLighter: '#d0d0d0',
  },
});

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
  const [showModal, setShowModal] = useState(false);
  const [editableProperty, setEditableProperty] = useState('');

  const handlePropertyEdit = (newName: string, newValue: string): void => {
    props.onChange({ ...omit(props.formData, editableProperty), [newName]: newValue });
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

  return (
    <div className="ObjectFieldTemplate">
      {(props.uiSchema['ui:title'] || props.title) && (
        <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
          {props.uiSchema['ui:title'] || props.title}
        </Separator>
      )}
      {props.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.description}</p>
      )}
      {props.properties.map(p => (
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
    </div>
  );
};

export default ObjectFieldTemplate;
