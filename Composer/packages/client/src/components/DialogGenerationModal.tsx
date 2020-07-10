// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { DialogWrapper } from './DialogWrapper/DialogWrapper';
import { DialogTypes } from './DialogWrapper/styles';
import { DropZone } from './DropZone';
import { FilePicker, FilePickerRef } from './FilePicker';

const noop = () => {};
const schemaEditorHeight = 300;
const validateSchemaFileName = (file: File) => file.type === 'application/json';
const defaultValue: object = {};

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

type DialogGenerationModalProps = {
  /**
   * Indicates if the modal is open.
   */
  isOpen: boolean;
  /**
   * Callback for when the generate button is clicked.
   */
  onGenerate: (schemaContent: string) => void;
  /**
   * Callback for when the modal is dismissed.
   */
  onDismiss: () => void;
};

export const DialogGenerationModal = (props: DialogGenerationModalProps) => {
  const { isOpen, onDismiss, onGenerate } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = React.useRef<any>();
  const filePickerRef = React.useRef<FilePickerRef>(null);
  const getEditorValueRef = React.useRef<() => string>(() => JSON.stringify(defaultValue, null, 2));
  const [file, setFile] = React.useState<File | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [editorErrorMessage, setEditorErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    if (file) {
      (async () => {
        const content = await readFileContent(file);
        editorRef.current.setValue(content);
      })();
    }
  }, [file]);

  const onSelectedSchemaChange = (fileList: FileList) => {
    setFile(fileList.item(0));
  };

  const onDropFiles = (files: readonly File[]) => {
    const file = files[0];
    if (validateSchemaFileName(file)) {
      setFile(files[0]);
      setErrorMessage('');
      filePickerRef.current?.reset();
    } else {
      setErrorMessage(formatMessage('Please select a valid schema file in json format.'));
    }
  };

  const onEditorError = (error: string) => {
    setEditorErrorMessage(error);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEditorDidMount = (getValue: () => string, editor: any) => {
    editorRef.current = editor;
    getEditorValueRef.current = getValue;
  };

  return isOpen ? (
    <DialogWrapper
      dialogType={DialogTypes.CreateFlow}
      isOpen={isOpen}
      subText={formatMessage('Select, type or drop a schema file to begin generating dialogs')}
      title={formatMessage('Generate Dialog')}
      onDismiss={onDismiss}
    >
      <DropZone dropMessage={formatMessage('Drop your schema here')} onDropFiles={onDropFiles}>
        <Stack styles={{ root: { marginBottom: 24 } }} tokens={{ childrenGap: 12 }}>
          {errorMessage && <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>}
          <FilePicker
            ref={filePickerRef}
            accept=".json"
            label={formatMessage('Schema')}
            onChange={onSelectedSchemaChange}
          />
          <JsonEditor
            editorDidMount={onEditorDidMount}
            editorSettings={{ lineNumbers: true, minimap: true, wordWrap: true }}
            height={schemaEditorHeight}
            value={defaultValue}
            onChange={noop}
            onError={onEditorError}
          />
        </Stack>
      </DropZone>
      <DialogFooter>
        <DefaultButton onClick={onDismiss}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton disabled={!!editorErrorMessage} onClick={() => onGenerate(getEditorValueRef.current())}>
          {formatMessage('Generate')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  ) : null;
};
