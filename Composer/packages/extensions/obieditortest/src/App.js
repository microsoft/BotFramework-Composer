import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { getMergedSchema } from './schema/appschema';

import './App.css';

const getType = data => {
  return data.$type;
};

// TODO: REMOVE AFTER RUNTIME UPDATES TO NAMED DIALOG REF
const runtimePathRegex = new RegExp(/^(\.\.\/\.\.\/[a-zA-Z])/); // "../../WORD"
const composerPathRegex = new RegExp(/^(\.\.\/\.\.\/\.\.\/[a-zA-Z])/); // "// ../../../WORD"
const makeState = data => {
  if (data && data.dialog && data.dialog.$ref) {
    if (runtimePathRegex.test(data.dialog.$ref)) {
      data.dialog.$ref = `../${data.dialog.$ref}`;
    }
  }
  data.$copy = undefined;
  data.$id = undefined;
  data.property = undefined;
  return data;
};

export const FormEditor = props => {
  const { data, memory, dialogs } = props;

  const [dialogForm, setDialogForm] = useState(makeState(data));
  const type = getType(data);

  const mergedSchema = getMergedSchema(dialogs);

  const dialogSchema = {
    definitions: { ...mergedSchema.definitions },
    ...mergedSchema.definitions[type],
  };

  const dialogUiSchema = {
    ...uiSchema[type],
  };

  const onChange = newValue => {
    // TODO: REMOVE AFTER RUNTIME UPDATES TO NAMED DIALOG REFS
    if (newValue.formData && newValue.formData.dialog && newValue.formData.dialog.$ref) {
      if (composerPathRegex.test(newValue.formData.dialog.$ref)) {
        newValue.formData.dialog.$ref = newValue.formData.dialog.$ref.replace(/^(\.\.\/)/, '');
      }
    }
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

  useEffect(() => {
    setDialogForm(makeState(data));
  }, [data]);

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
          formData={dialogForm}
          onBlur={props.onBlur}
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
