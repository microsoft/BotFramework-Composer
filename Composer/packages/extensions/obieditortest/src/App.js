import React from 'react';
import PropTypes from 'prop-types';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { mergedSchema } from './schema/appschema';

import './App.css';

const getType = data => {
  return data.$type;
};

export const FormEditor = props => {
  const { data, memory } = props;
  const type = getType(data);

  const dialogSchema = {
    definitions: { ...mergedSchema.definitions },
    ...mergedSchema.definitions[type],
  };

  const dialogUiSchema = {
    ...uiSchema[type],
  };

  const onChange = newValue => {
    props.onChange(newValue.formData);
  };

  const buildScope = (memory, scope) => {
    if (!memory || !memory[scope]) return [];

    const options = getOptions(memory, scope);

    if (options.length === 0) return [];

    return [
      { key: scope, text: scope.toUpperCase(), itemType: DropdownMenuItemType.Header },
      ...options,
      { key: `${scope}_divider`, text: '-', itemType: DropdownMenuItemType.Divider },
    ];
  };

  const getOptions = (memory, scope) => {
    const options = [];
    for (const key in memory[scope]) {
      options.push({ key: `${scope}.${key}`, text: `${memory[scope][key]}` });
    }
    return options;
  };

  const onMemoryDropdownChange = (event, option) => {
    navigator.clipboard.writeText(`{${option.key}}`);
  };

  const memoryOptions = [
    ...buildScope(memory, 'user'),
    ...buildScope(memory, 'conversation'),
    ...buildScope(memory, 'dialog'),
    ...buildScope(memory, 'turn'),
  ];

  return (
    <Customizer {...FluentCustomizations}>
      <div className="App" style={{ margin: '15px 15px 15px 15px' }}>
        {memoryOptions.length > 0 && (
          <Dropdown
            style={{ width: '300px', paddingBottom: '10px' }}
            placeholder="Memory available to this Dialog"
            options={memoryOptions}
            onChange={onMemoryDropdownChange}
            onFocus={() => {}}
            selectedKey={null}
          />
        )}
        <Form
          noValidate
          className="schemaForm"
          onChange={onChange}
          formData={data}
          schema={dialogSchema}
          uiSchema={dialogUiSchema}
        >
          <button style={{ display: 'none' }} />
        </Form>
      </div>
    </Customizer>
  );
};

FormEditor.propTypes = {
  data: PropTypes.shape({ data: PropTypes.any }),
  memory: PropTypes.shape({
    user: PropTypes.any,
    conversation: PropTypes.any,
    turn: PropTypes.any,
    dialog: PropTypes.any,
  }),
  onChange: PropTypes.func,
};

export default FormEditor;
