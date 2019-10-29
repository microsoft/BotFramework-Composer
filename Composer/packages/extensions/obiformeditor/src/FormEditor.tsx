/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useState } from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6Definition, JSONSchema6 } from 'json-schema';
import merge from 'lodash.merge';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';
import { appschema, ShellData, ShellApi } from 'shared';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { getMemoryOptions } from './Form/utils';
import { FormMemory, FormData } from './types';

const getType = (data: FormData): string | undefined => {
  return data.$type;
};

export interface FormEditorProps extends ShellData {
  memory: FormMemory;
  onBlur?: () => void;
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
}

export const FormEditor: React.FunctionComponent<FormEditorProps> = props => {
  const { data, schemas, memory, dialogs, shellApi } = props;
  const [localData, setLocalData] = useState(data);
  const type = getType(localData);

  if (!type) {
    return (
      <div>
        Malformed data: missing $type.
        <pre>{JSON.stringify(localData, null, 2)}</pre>
      </div>
    );
  }

  const definitions = appschema.definitions || {};
  const typeDef: JSONSchema6Definition = definitions[type];

  if (!typeDef) {
    return (
      <div>
        Malformed data: missing type defintion in schema.
        <pre>{JSON.stringify(localData, null, 2)}</pre>
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
    if (!isEqual(newValue.formData, localData)) {
      props.onChange(newValue.formData);
      setLocalData(newValue.formData);
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
        formData={localData}
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
          currentDialog: props.currentDialog,
          dialogId: get(data, '$designer.id'),
          isRoot: props.focusPath.endsWith('#'),
          focusedEvent: props.focusedEvent,
          focusedSteps: props.focusedSteps,
          focusedTab: props.focusedTab,
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
