// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { RecoilRoot, useRecoilTransactionObserver_UNSTABLE } from 'recoil';
import { formDialogSchemaJsonSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { FormDialogPropertiesEditor } from 'src/components/FormDialogPropertiesEditor';

export type FormDialogSchemaEditorProps = {
  /**
   * Unique id for the visual editor.
   */
  editorId: string;
  /**
   * Initial json schema content.
   */
  schema: { id: string; content: string };
  /**
   * Form dialog schema file extension.
   */
  schemaExtension?: string;
  /**
   * Record of available schema templates.
   */
  templates?: string[];
  /**
   * Callback for when the json schema update is updated.
   */
  onSchemaUpdated: (id: string, content: string) => void;
  /**
   * Callback for generating dialog using current valid form dialog schema.
   */
  onGenerateDialog: (formDialogSchemaJson: string) => void;
};

const InternalFormDialogSchemaEditor = React.memo((props: FormDialogSchemaEditorProps) => {
  const { editorId, schema, templates = [], schemaExtension = '.schema', onSchemaUpdated, onGenerateDialog } = props;

  const { setTemplates, reset, importSchemaString } = useHandlers();

  React.useEffect(() => {
    setTemplates({ templates });
  }, [templates]);

  React.useEffect(() => {
    importSchemaString(schema);
  }, [editorId]);

  const startOver = React.useCallback(() => {
    reset({ name: editorId });
  }, [reset, editorId]);

  useRecoilTransactionObserver_UNSTABLE(async ({ snapshot, previousSnapshot }) => {
    const content = await snapshot.getPromise(formDialogSchemaJsonSelector);
    const prevContent = await previousSnapshot.getPromise(formDialogSchemaJsonSelector);
    if (content !== prevContent) {
      onSchemaUpdated(schema.id, content);
    }
  });

  return (
    <FormDialogPropertiesEditor
      key={editorId}
      schemaExtension={schemaExtension}
      onGenerateDialog={onGenerateDialog}
      onReset={startOver}
    />
  );
});

export const FormDialogSchemaEditor = (props: FormDialogSchemaEditorProps) => {
  return (
    <RecoilRoot>
      <InternalFormDialogSchemaEditor {...props}></InternalFormDialogSchemaEditor>
    </RecoilRoot>
  );
};
