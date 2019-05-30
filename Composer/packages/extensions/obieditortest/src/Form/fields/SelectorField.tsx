import React from 'react';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';

import { UnsupportedField } from './UnsupportedField';

export const SelectorField: React.FC<FieldProps> = props => <UnsupportedField {...props} fieldName="SelectorField" />;
