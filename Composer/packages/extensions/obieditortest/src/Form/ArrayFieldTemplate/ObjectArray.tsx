import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from '@bfdesigner/react-jsonschema-form';

import { BaseField } from '../fields/BaseField';

import ArrayItem from './ArrayItem';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick } = props;

  return (
    <BaseField {...props}>
      {items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {canAdd && (
        <PrimaryButton type="button" onClick={onAddClick} data-testid="ArrayContainerAdd">
          Add
        </PrimaryButton>
      )}
    </BaseField>
  );
};

ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default ObjectArray;
