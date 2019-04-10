import React from 'react';
import PropTypes from 'prop-types';
import { findSchemaDefinition } from 'react-jsonschema-form/lib/utils';

import StringArray from './StringArray';
import ObjectArray from './ObjectArray';

export default function ArrayFieldTemplate(props) {
  let itemSchema = props.schema.items;

  if (!itemSchema.type && itemSchema.$ref) {
    itemSchema = findSchemaDefinition(itemSchema.$ref, props.registry.definitions);
  }

  switch (itemSchema.type) {
    case 'object':
      return <ObjectArray {...props} />;
    default:
      return <StringArray {...props} />;
  }
}

const ArrayFieldProps = {
  canAdd: PropTypes.bool,
  description: PropTypes.string,
  DescriptionField: PropTypes.func,
  idSchema: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.node),
  onAddClick: PropTypes.func,
  registry: PropTypes.shape({
    definitions: PropTypes.object,
  }),
  schema: PropTypes.shape({
    items: PropTypes.object,
  }),
  title: PropTypes.string,
  TitleField: PropTypes.func,
};

ArrayFieldTemplate.propTypes = ArrayFieldProps;
StringArray.propTypes = ArrayFieldProps;
ObjectArray.propTypes = ArrayFieldProps;
