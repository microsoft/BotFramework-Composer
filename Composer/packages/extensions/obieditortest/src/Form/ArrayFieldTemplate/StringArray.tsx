import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from 'react-jsonschema-form';

import ArrayItem from './ArrayItem';

import './styles.scss';

const StringArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {props.items.map((element, idx) => (
        <ArrayItem {...element} key={JSON.stringify(props.formData[idx]) || idx} />
      ))}
      {props.canAdd && (
        <PrimaryButton type="button" onClick={e => props.onAddClick(e)} styles={{ root: { marginTop: '10px' } }}>
          Add
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
