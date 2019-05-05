import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from 'react-jsonschema-form';
import formatMessage from 'format-message';

import ArrayItem from './ArrayItem';

import './styles.scss';

const StringArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {props.items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {props.canAdd && (
        <PrimaryButton type="button" onClick={e => props.onAddClick(e)} styles={{ root: { marginTop: '10px' } }}>
          {formatMessage('Add')}
        </PrimaryButton>
      )}
    </div>
  );
};

StringArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default StringArray;
