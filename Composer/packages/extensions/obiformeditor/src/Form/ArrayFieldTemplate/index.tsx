// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { findSchemaDefinition } from '@bfcomposer/react-jsonschema-form/lib/utils';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';

import StringArray from './StringArray';
import ObjectArray from './ObjectArray';
import IDialogArray from './IDialogArray';

const ArrayFieldTemplate: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  if (!props.schema.items) {
    return null;
  }

  let itemSchema = props.schema.items as any;
  const $ref = itemSchema.$ref;

  if (!itemSchema.type && $ref) {
    itemSchema = findSchemaDefinition($ref, props.registry.definitions);
  }

  switch (itemSchema.type) {
    case 'object':
      if ($ref && $ref.includes('IDialog')) {
        return <IDialogArray {...props} />;
      }

      return <ObjectArray {...props} />;
    default:
      return <StringArray {...props} />;
  }
};

export default ArrayFieldTemplate;
