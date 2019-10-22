import React from 'react';
import { toIdSchema } from '@bfcomposer/react-jsonschema-form/lib/utils';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';
import { MicrosoftIRecognizer } from 'shared';

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

  return <ObjectField {...props} schema={schema} idSchema={idSchema} />;
}
