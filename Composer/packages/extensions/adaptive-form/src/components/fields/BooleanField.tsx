// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FieldProps } from '@bfc/extension';

import { FieldLabel } from '../FieldLabel';

const styles = css`
  display: flex;
  align-items: center;

  label: BooleanField;
`;

const BooleanField: React.FC<FieldProps> = function CheckboxWidget(props) {
  const { onChange, onBlur, onFocus, value, label, id, schema } = props;
  const { description } = schema;

  return (
    <div css={styles}>
      <Checkbox
        checked={Boolean(value)}
        id={id}
        onBlur={() => onBlur && onBlur(id, Boolean(value))}
        onChange={(_, checked?: boolean) => onChange(checked)}
        onFocus={() => onFocus && onFocus(id, Boolean(value))}
      />
      <FieldLabel inline description={description} id={id} label={label} />
    </div>
  );
};

export { BooleanField };
