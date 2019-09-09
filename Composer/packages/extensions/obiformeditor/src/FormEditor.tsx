import React from 'react';
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

const getType = (data: FormData): string | undefined => {
  return data.$type;
};

export interface FormEditorProps {
  data: FormData;
  currentDialog: DialogInfo;
  dialogs: DialogInfo[];
  focusPath: string;
  focusedEvent: string;
  focusedSteps: string[];
  isRoot: boolean;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  memory: FormMemory;
  onBlur?: () => void;
  onChange: (newData: object, updatePath?: string) => void;
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

  const dialogOptions = dialogs.map(f => ({ value: f.id, label: f.displayName }));

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
    <div>
      {memoryOptions.length > 0 && (
        <Dropdown
          style={{ width: '300px', paddingBottom: '10px', paddingLeft: '18px', paddingTop: '18px' }}
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
          shellApi: {
            ...shellApi,
            onFocusSteps: stepIds => shellApi.onFocusSteps(stepIds),
          },
          dialogOptions,
          editorSchema: schemas.editor,
          rootId: props.focusPath,
          luFiles: props.luFiles,
          lgFiles: props.lgFiles,
          currentDialog: props.currentDialog,
          dialogId: get(data, '$designer.id'),
          isRoot: props.focusPath.endsWith('#'),
        }}
        idPrefix={props.focusPath}
      >
        <button style={{ display: 'none' }} />
      </Form>
    </div>
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
