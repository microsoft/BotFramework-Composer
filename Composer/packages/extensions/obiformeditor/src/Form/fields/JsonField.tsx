// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { JsonEditor } from '@bfc/code-editor';

import './styles.css';

import { BaseField } from './BaseField';

export const JsonField: React.FC<FieldProps> = props => {
  return (
    <BaseField {...props} className="JsonField">
      <div style={{ height: '315px' }}>
        <JsonEditor onChange={props.onChange} value={props.formData} />
      </div>
    </BaseField>
  );
};
