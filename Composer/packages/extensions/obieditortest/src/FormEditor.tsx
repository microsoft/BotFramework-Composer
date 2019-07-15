import React from 'react';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6Definition, JSONSchema6 } from 'json-schema';
import merge from 'lodash.merge';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { appschema } from './schema/appschema';
import { getMemoryOptions, getTimestamp } from './Form/utils';
import { DialogInfo, FormMemory, FormData, ShellApi, EditorSchema, LuFile, LgFile } from './types';

import './FormEditor.css';

const getType = (data: FormData): string | undefined => {
  return data.$type;
};

export interface FormEditorProps {
  data: FormData;
  dialogName: string;
  dialogs: DialogInfo[];
  focusPath: string;
  isRoot: boolean;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  memory: FormMemory;
  navPath: string;
  onBlur?: () => void;
  onChange: (newData: object) => void;
  schemas: EditorSchema;
  shellApi: ShellApi;
}

function updateDesigner(data) {
  if (data && data.$designer) {
    data.$designer.updatedAt = getTimestamp();
  }

  return data;
}

export const FormEditor: React.FunctionComponent<FormEditorProps> = props => {
  const { data, schemas, memory, dialogs, shellApi } = props;
  const type = getType(data);

  if (!type) {
    return (
      <div>
        Malformed data: missing $type.
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  const definitions = appschema.definitions || {};
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
    ...(typeDef as JSONSchema6),
    definitions: merge({}, definitions, (typeDef as JSONSchema6).definitions),
  };

  const dialogUiSchema = {
    ...uiSchema[type],
  };

  const dialogOptions = dialogs.map(f => f.id);

  const onChange = newValue => {
    if (!isEqual(newValue.formData, data)) {
      props.onChange(updateDesigner(newValue.formData));
    }
  };

  const onMemoryDropdownChange = (event, option) => {
    (navigator as any).clipboard.writeText(`{${option.key}}`);
  };

  const memoryOptions = getMemoryOptions(memory);

  return (
    <Customizer {...FluentCustomizations}>
      <div className="App">
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
            dialogOptions,
            editorSchema: schemas.editor,
            rootId: props.focusPath,
            luFiles: props.luFiles,
            lgFiles: props.lgFiles,
            dialogName: props.dialogName,
            dialogId: get(data, '$designer.id'),
            isRoot: props.isRoot,
          }}
          idPrefix={props.focusPath}
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
  schemas: {
    editor: {},
  },
};

export default FormEditor;
