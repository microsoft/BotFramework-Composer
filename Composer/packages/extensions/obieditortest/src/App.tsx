import React from 'react';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6Definition } from 'json-schema';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { getMergedSchema } from './schema/appschema';
import { getMemoryOptions } from './Form/utils';
import { DialogInfo, FormMemory, FormData, ShellApi } from './types';

import './App.css';

const getType = (data: FormData): string | undefined => {
  return data.$type;
};

interface FormEditorProps {
  data: FormData;
  dialogs: DialogInfo[];
  memory: FormMemory;
  shellApi: ShellApi;
  onChange: (newData: object) => void;
  onBlur?: () => void;
}

export const FormEditor: React.FunctionComponent<FormEditorProps> = props => {
  const { data, memory, dialogs, shellApi } = props;
  const type = getType(data);

  if (!type) {
    return (
      <div>
        Malformed data: missing $type.
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  const mergedSchema = getMergedSchema(dialogs);

  const definitions = mergedSchema.definitions || {};
  const typeDef: JSONSchema6Definition = definitions[type];

  if (!typeDef) {
    return (
      <div>
        Malformed data: missing type defintion in schema.
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  const dialogSchema = {
    definitions,
    ...(typeDef as object),
  };

  const dialogUiSchema = {
    ...uiSchema[type],
  };

  const onChange = newValue => {
    props.onChange(newValue.formData);
  };

  const onMemoryDropdownChange = (event, option) => {
    (navigator as any).clipboard.writeText(`{${option.key}}`);
  };

  const memoryOptions = getMemoryOptions(memory);

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
          onBlur={props.onBlur}
          schema={dialogSchema}
          uiSchema={dialogUiSchema}
          formContext={{
            shellApi,
          }}
        >
          <button style={{ display: 'none' }} />
        </Form>
      </div>
    </Customizer>
  );
};

FormEditor.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
};

export default FormEditor;
