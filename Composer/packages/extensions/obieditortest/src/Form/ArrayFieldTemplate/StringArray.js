/* eslint react/prop-types:off */
import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';

import ArrayItem from './ArrayItem';

import './styles.scss';

export default function StringArray(props) {
  const { TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {props.items.map((element, idx) => (
        <ArrayItem {...element} key={JSON.stringify(props.formData[props.index]) || idx} />
      ))}
      {props.canAdd && (
        <PrimaryButton type="button" onClick={props.onAddClick} styles={{ root: { marginTop: '10px' } }}>
          Add
        </PrimaryButton>
      )}
    </div>
  );
}

StringArray.defaultProps = {
  formData: [],
  idSchema: {},
  items: [],
  onAddClick: () => {},
};
