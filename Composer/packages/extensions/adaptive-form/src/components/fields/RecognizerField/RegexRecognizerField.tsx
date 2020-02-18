// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { JSONSchema4 } from 'json-schema';
import { FieldProps } from '@bfc/extension';

import SchemaField from '../../SchemaField';

const RegexRecognizerField: React.FC<FieldProps> = props => {
  const schema = props.schema.oneOf?.find(
    s => typeof s === 'object' && s.title === 'Microsoft.RegexRecognizer'
  ) as JSONSchema4;

  return (
    <div css={{ label: 'RegexRecognizerField' }}>
      <SchemaField {...props} depth={props.depth + 1} schema={schema} />
    </div>
  );
};

export { RegexRecognizerField };
