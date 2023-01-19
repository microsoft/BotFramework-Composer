// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/react';
import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { getArrayItemProps, isItemValueEmpty, useArrayItems } from '../../utils';
import { FieldLabel } from '../FieldLabel';
import { AddButton } from '../AddButton';

import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

const ArrayField: React.FC<FieldProps<unknown[]>> = (props) => {
  const {
    value,
    onChange,
    schema,
    label,
    description,
    id,
    rawErrors = [],
    uiOptions,
    className,
    required,
    ...rest
  } = props;
  const { arrayItems, handleChange, addItem } = useArrayItems(value, onChange);

  const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;

  const onClick = React.useCallback(() => {
    addItem(undefined);
  }, [addItem]);

  if (!itemSchema || itemSchema === true) {
    return <UnsupportedField {...props} />;
  }

  const canAddMore = !(arrayItems.length && isItemValueEmpty(arrayItems[arrayItems.length - 1]?.value));

  return (
    <div className={className}>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {arrayItems.map((element, idx) => (
        <ArrayFieldItem
          {...rest}
          key={element.id}
          ariaLabel={formatMessage('{label}: row {index}', { label, index: idx + 1 })}
          autofocus={!element.value && idx === arrayItems.length - 1}
          error={rawErrors[idx]}
          id={`${id}.${idx}`}
          label={false}
          rawErrors={rawErrors[idx]}
          schema={itemSchema}
          uiOptions={uiOptions}
          value={element.value}
          {...getArrayItemProps(arrayItems, idx, handleChange)}
        />
      ))}
      <AddButton disabled={!canAddMore} onClick={onClick} />
    </div>
  );
};

export { ArrayField };
