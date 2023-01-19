// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/react';
import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';
import { getPropertyItemProps, useObjectItems } from '../../../utils/objectUtils';
import { AddButton } from '../../AddButton';

import { ObjectItem } from './ObjectItem';

const OpenObjectField: React.FC<FieldProps<{
  [key: string]: unknown;
}>> = (props) => {
  const {
    definitions,
    description,
    id,
    label,
    required,
    schema: { additionalProperties },
    uiOptions,
    value = {},
    onChange,
  } = props;

  const { addProperty, objectEntries, onChange: handleChange } = useObjectItems(value, onChange);

  const onClick = React.useCallback(() => {
    addProperty();
  }, [addProperty]);

  return (
    <div className="OpenObjectField">
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {objectEntries.map(({ id, propertyName, propertyValue }, index) => {
        return (
          <ObjectItem
            key={index}
            definitions={definitions}
            formData={value}
            id={`${id}.value`}
            name={propertyName}
            required={required}
            schema={typeof additionalProperties === 'object' ? additionalProperties : {}}
            uiOptions={uiOptions.properties?.additionalProperties || {}}
            value={propertyValue}
            {...getPropertyItemProps(objectEntries, index, handleChange)}
          />
        );
      })}
      {additionalProperties && (
        <AddButton
          ariaLabel={label ? formatMessage('Add new value to the {label} field', { label }) : undefined}
          onClick={onClick}
        />
      )}
    </div>
  );
};

export { OpenObjectField };
