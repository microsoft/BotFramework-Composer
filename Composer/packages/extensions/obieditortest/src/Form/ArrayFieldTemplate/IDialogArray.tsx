import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from 'react-jsonschema-form';

import { buildDialogOptions } from '../utils';

import ArrayItem from './ArrayItem';

const IDialogArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick, TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {canAdd && (
        <PrimaryButton
          type="button"
          onClick={e => {
            onAddClick(e, { $type: 'Microsoft.AdaptiveDialog' });
          }}
          split
          menuProps={{
            items: buildDialogOptions((newItem, e) => onAddClick(e, newItem), item => !item.includes('Rule')),
          }}
          data-testid="ArrayContainerAdd"
        >
          Add
        </PrimaryButton>
      )}
    </div>
  );
};

IDialogArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default IDialogArray;
