import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from 'react-jsonschema-form';

import ArrayItem from './ArrayItem';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick, TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {canAdd && (
        <PrimaryButton type="button" onClick={onAddClick} data-testid="ArrayContainerAdd">
          Add
        </PrimaryButton>
      )}
    </div>
  );
};

ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default ObjectArray;
