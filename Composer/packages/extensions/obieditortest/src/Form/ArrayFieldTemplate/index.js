import React from 'react';
import PropTypes from 'prop-types';
import { Modal, IconButton, TextField, Button, Text, Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react';
import { findSchemaDefinition } from 'react-jsonschema-form/lib/utils';

import { dialogGroups } from '../../schema/appschema';

import StringArray from './StringArray';

const buildDialogOptions = () => {
  const options = [];

  for (const elem in dialogGroups) {
    options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
    dialogGroups[elem].forEach(dialog => {
      options.push({ key: dialog, text: dialog });
    });
    options.push({ key: `${elem}_divider`, text: '-', itemType: DropdownMenuItemType.Divider });
  }

  return options;
};

export default function ArrayFieldTemplate(props) {
  const { title, items, canAdd, onAddClick, schema } = props;

  console.log('schema', schema, items);

  const itemSchema = schema.items;
  console.log(itemSchema);

  switch (itemSchema.type) {
    case 'string':
      return <StringArray {...props} />;
    default:
      return (
        <div>
          <h3>{title}</h3>
          {items.map(element => element.children)}
          {canAdd && (
            <Button
              type="button"
              onClick={() => console.info('click')}
              split
              menuProps={{ items: buildDialogOptions() }}
            >
              Add
            </Button>
          )}
        </div>
      );
  }
}

const ArrayFieldProps = {
  canAdd: PropTypes.bool,
  description: PropTypes.string,
  DescriptionField: PropTypes.func,
  idSchema: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.node),
  onAddClick: PropTypes.func,
  title: PropTypes.string,
  TitleField: PropTypes.func,
};

ArrayFieldTemplate.propTypes = ArrayFieldProps;
StringArray.propTypes = ArrayFieldProps;
