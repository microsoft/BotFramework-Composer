// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { ActionButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { FluentTheme } from '@uifabric/fluent-theme';

import { getArrayItemProps, useArrayItems } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

const ButtonContainer = styled.div({
  borderTop: `1px solid ${FluentTheme.palette.neutralLight}`,
  width: '100%',
});

const styles: { actionButton: IButtonStyles } = {
  actionButton: {
    root: {
      fontSize: FluentTheme.fonts.small.fontSize,
      fontWeight: FluentTheme.fonts.small.fontWeight,
      color: FluentTheme.palette.themePrimary,
      paddingLeft: 8,
      height: 20,
    },
  },
};

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

  return (
    <div className={className}>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {arrayItems.map((element, idx) => (
        <ArrayFieldItem
          {...rest}
          key={element.id}
          error={rawErrors[idx]}
          id={id}
          label={false}
          rawErrors={rawErrors[idx]}
          schema={itemSchema}
          uiOptions={uiOptions}
          value={element.value}
          {...getArrayItemProps(arrayItems, idx, handleChange)}
        />
      ))}
      <ButtonContainer>
        <ActionButton styles={styles.actionButton} onClick={onClick}>
          {formatMessage('Add new')}
        </ActionButton>
      </ButtonContainer>
    </div>
  );
};

export { ArrayField };
