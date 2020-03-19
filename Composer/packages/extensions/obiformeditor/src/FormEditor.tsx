// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { Global, jsx } from '@emotion/core';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6Definition, JSONSchema6 } from 'json-schema';
import merge from 'lodash/merge';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { appschema, ShellData, ShellApi, Diagnostic } from '@bfc/shared';

import Form from './Form';
import { uiSchema } from './schema/uischema';
import { getMemoryOptions } from './Form/utils';
import { FormMemory, FormData } from './types';
import { root } from './styles';

const getType = (data: FormData): string | undefined => {
  return data.$type;
};

export interface FormEditorProps extends ShellData {
  memory?: FormMemory;
  onBlur?: () => void;
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
}

export const FormEditor: React.FunctionComponent<FormEditorProps> = props => {
  const { data, schemas, memory, dialogs, shellApi } = props;
  const [localData, setLocalData] = useState(data);
  const type = getType(localData);

  const sync = useRef(
    debounce((shellData: FormData, localData: FormData) => {
      if (!isEqual(shellData, localData)) {
        setLocalData(shellData);
      }
    }, 750)
  ).current;

  useEffect(() => {
    sync(data, localData);

    return () => {
      sync.cancel();
    };
  }, [data]);

  const formErrors = useMemo(() => {
    if (props.currentDialog && props.currentDialog.diagnostics) {
      const currentPath = props.focusPath.replace('#', '');
      const diagnostics = get(props.currentDialog, 'diagnostics', [] as Diagnostic[]);

      return diagnostics.reduce((errors, d) => {
        const [dPath, dType, dProp] = d.path?.split('#') || [];
        const dPropName = dProp
          ?.replace('[', '')
          ?.replace(']', '')
          ?.replace('.', '');

        if (dPath === currentPath && dType === type && dPropName) {
          errors[dPropName] = d.message;
        }

        return errors;
      }, {});
    }

    return {};
  }, [props.currentDialog]);

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
      <Global styles={root} />
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
          projectId: props.projectId,
          isRoot: props.focusPath.endsWith('#'),
          focusedEvent: props.focusedEvent,
          focusedSteps: props.focusedSteps,
          focusedTab: props.focusedTab,
          formErrors,
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
