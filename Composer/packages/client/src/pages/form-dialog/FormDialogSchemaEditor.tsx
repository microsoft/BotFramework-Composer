// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonEditor } from '@bfc/code-editor';
import { VisualSchemaEditor } from '@bfc/form-dialogs';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { IStackProps, IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import styled from '@emotion/styled';

import { DropZone } from '../../components/DropZone';

const Root = styled(Stack)<{
  loading: boolean;
}>(
  {
    position: 'relative',
    width: '100%',
    backgroundColor: '#c8c6c4',
  },
  (props) =>
    props.loading
      ? {
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255, 0.6)',
            zIndex: 1,
          },
        }
      : null
);

/**
 * @description
 * Reads the given file as a string and returns its
 * contents in a promise.
 *
 * @param file The file to read.
 */
const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsText(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = reject;
  });
};

const noop = () => {};
const defaultValue: object = {};

const editorTopBarStyles = classNamesFunction<IStackProps, IStackStyles>()({
  root: { backgroundColor: '#fff', height: '45px' },
});

const validateSchemaFileName = (file: File) => file.name.endsWith('FileExtensions.FormDialogSchema');

type Props = {
  projectId?: string;
  loading?: boolean;
  schema: { id: string; content: string };
  templates: string[];
  onChange: (id: string, content: string) => void;
};

export const FormDialogSchemaEditor = React.memo((props: Props) => {
  const { projectId, schema, templates, onChange, loading = false } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = React.useRef<any>();
  const getEditorValueRef = React.useRef<() => string>(() => schema.content || JSON.stringify(defaultValue, null, 2));
  const dialogSchemaContentRef = React.useRef(schema.content || JSON.stringify(defaultValue, null, 2));

  const [showEditor, setShowEditor] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    if (showEditor) {
      dialogSchemaContentRef.current = schema.content || JSON.stringify(defaultValue, null, 2);
    }
    editorRef.current?.setValue(schema.content);
  }, [schema.content]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEditorDidMount = (getValue: () => string, editor: any) => {
    editorRef.current = editor;
    getEditorValueRef.current = getValue;
    editorRef.current.setValue(dialogSchemaContentRef.current);
  };

  const onSchemaUpdated = (id: string, content: string) => {
    onChange(id, content);

    dialogSchemaContentRef.current = content;
    editorRef.current?.setValue(content);
  };

  const onDropFiles = async (files: readonly File[]) => {
    const file = files[0];
    if (validateSchemaFileName(file)) {
      setErrorMessage('');
      const content = await readFileContent(file);
      onChange(schema.id, content);
    } else {
      setErrorMessage(formatMessage('Please select a valid schema file in json format.'));
    }
  };

  return (
    <Root loading={loading}>
      <Stack horizontal horizontalAlign="end" styles={editorTopBarStyles} verticalAlign="center">
        <ActionButton onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      </Stack>

      <Stack
        grow
        styles={{
          root: {
            flex: 1,
            position: 'relative',
            overflowY: 'auto',
            backgroundColor: showEditor ? '#fff' : 'transparent',
          },
        }}
      >
        {errorMessage && <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>}
        {!showEditor ? (
          <DropZone
            dropMessage={formatMessage('Drop your schema here')}
            style={{ display: 'flex', flexDirection: 'column' }}
            onDropFiles={onDropFiles}
          >
            <VisualSchemaEditor
              editorId={`${projectId}:${schema.id}`}
              schema={schema}
              schemaExtension=".form-dialog"
              templates={templates}
              onSchemaUpdated={onSchemaUpdated}
            />
          </DropZone>
        ) : (
          <JsonEditor
            editorDidMount={onEditorDidMount}
            editorSettings={{ lineNumbers: true, minimap: true, wordWrap: true }}
            height="calc(100%)"
            options={{ readOnly: true }}
            value={defaultValue}
            onChange={noop}
            onError={noop}
          />
        )}
      </Stack>
    </Root>
  );
});
