// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';

import ArrayItem from './ArrayItem';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick } = props;

  return (
    <BaseField {...props}>
      <div className="ObjectArray">
        {items.map((element, idx) => (
          <ArrayItem {...element} key={idx} />
        ))}
        {canAdd && (
          <DefaultButton
            type="button"
            onClick={onAddClick}
            data-testid="ArrayContainerAdd"
            styles={{ root: { marginTop: '14px' } }}
          >
            {formatMessage('Add')}
          </DefaultButton>
        )}
      </div>
    </BaseField>
  );
};

ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default ObjectArray;
