// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { toIdSchema } from '@bfcomposer/react-jsonschema-form/lib/utils';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';
import { MicrosoftIRecognizer } from '@bfc/shared';

import { regexEditorContainer } from './styles';

export default function RegexEditor(props: FieldProps<MicrosoftIRecognizer>) {
  if (!props.schema.oneOf) {
    return null;
  }

  const {
    registry: {
      fields: { ObjectField },
      definitions,
    },
    formData,
    idPrefix,
  } = props;
  const schema = props.schema.oneOf.find(
    s => typeof s === 'object' && s.title === 'Microsoft.RegexRecognizer'
  ) as JSONSchema6;
  const idSchema = toIdSchema(schema, props.idSchema.__id, definitions, formData, idPrefix);

  return (
    <div css={regexEditorContainer}>
      <ObjectField {...props} schema={schema} idSchema={idSchema} />
    </div>
  );
}
