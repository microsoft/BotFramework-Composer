import React from 'react';
import { findSchemaDefinition } from 'react-jsonschema-form/lib/utils';

import StringArray from './StringArray';
import ObjectArray from './ObjectArray';
import { ArrayFieldTemplateProps } from 'react-jsonschema-form';

const ArrayFieldTemplate: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  if (!props.schema.items) {
    return null;
  }

  let itemSchema = props.schema.items as any;

  if (!itemSchema.type && itemSchema.$ref) {
    itemSchema = findSchemaDefinition(itemSchema.$ref, props.registry.definitions);
  }

  switch (itemSchema.type) {
    case 'object':
      return <ObjectArray {...props} />;
    default:
      return <StringArray {...props} />;
  }
};

export default ArrayFieldTemplate;
