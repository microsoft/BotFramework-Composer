// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useRecoilValue } from 'recoil';
// eslint-disable-next-line @typescript-eslint/camelcase
import { RecoilRoot, useRecoilTransactionObserver_UNSTABLE } from 'recoil';
import { formDialogSchemaJsonSelector, trackedAtomsSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { FormDialogPropertiesEditor } from 'src/components/FormDialogPropertiesEditor';
import { UndoRoot } from 'src/undo/UndoRoot';

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
   * Enables the undo/redo.
   */
  allowUndo?: boolean;
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
  const {
    editorId,
    schema,
    templates = [],
    schemaExtension = '.schema',
    onSchemaUpdated,
    onGenerateDialog,
    allowUndo = false,
  } = props;

  const trackedAtoms = useRecoilValue(trackedAtomsSelector);
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
    <UndoRoot key={schema.id} trackedAtoms={trackedAtoms}>
      <FormDialogPropertiesEditor
        key={editorId}
        allowUndo={allowUndo}
        schemaExtension={schemaExtension}
        onGenerateDialog={onGenerateDialog}
        onReset={startOver}
      />
    </UndoRoot>
  );
});

export const FormDialogSchemaEditor = (props: FormDialogSchemaEditorProps) => {
  return (
    <RecoilRoot>
      <InternalFormDialogSchemaEditor {...props}></InternalFormDialogSchemaEditor>
    </RecoilRoot>
  );
};
