// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { RecoilRoot, useRecoilTransactionObserver_UNSTABLE } from 'recoil';
import { formDialogSchemaJsonSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { VisualEditor } from 'src/components/VisualEditor';

export type FormDialogEditorProps = {
  /**
   * Unique id for the visual editor.
   */
  editorId: string;
  /**
   * Wether to show or hide the theme picker.
   */
  showThemePicker?: boolean;
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

const InternalFormDialogEditor = React.memo((props: FormDialogEditorProps) => {
  const {
    editorId,
    schema,
    showThemePicker = false,
    templates = [],
    schemaExtension = '.schema',
    onSchemaUpdated,
    onGenerateDialog,
  } = props;

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
    <VisualEditor
      key={editorId}
      schemaExtension={schemaExtension}
      showThemePicker={showThemePicker}
      onGenerateDialog={onGenerateDialog}
      onReset={startOver}
    />
  );
});

export const FormDialogEditor = (props: FormDialogEditorProps) => {
  return (
    <RecoilRoot>
      <InternalFormDialogEditor {...props}></InternalFormDialogEditor>
    </RecoilRoot>
  );
};
