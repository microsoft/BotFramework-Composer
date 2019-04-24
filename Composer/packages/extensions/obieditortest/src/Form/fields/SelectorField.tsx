import React from 'react';
import { FieldProps } from 'react-jsonschema-form';

import { UnsupportedField } from './UnsupportedField';

export const SelectorField: React.FC<FieldProps> = props => <UnsupportedField {...props} fieldName="SelectorField" />;
