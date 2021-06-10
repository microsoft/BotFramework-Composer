// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FormDialogSchemaTemplate } from '@bfc/shared';
import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { RecoilRoot, useRecoilTransactionObserver_UNSTABLE, useRecoilValue } from 'recoil';

import { formDialogSchemaJsonSelector, trackedAtomsSelector } from './atoms/appState';
import { useHandlers } from './atoms/handlers';
import { FormDialogPropertiesEditor } from './components/FormDialogPropertiesEditor';
import { UndoRoot } from './undo/UndoRoot';

export type FormDialogSchemaEditorProps = {
  locale: string;
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
  templates?: FormDialogSchemaTemplate[];
  /**
   * Indicates of caller is running generation logic.
   */
  isGenerating?: boolean;
  /**
   * Callback for when the json schema update is updated.
   */
  onSchemaUpdated: (id: string, content: string) => void;
  /**
   * Callback for generating dialog using current valid form dialog schema.
   */
  onGenerateDialog: (schemaId: string) => void;
};

const InternalFormDialogSchemaEditor = React.memo((props: FormDialogSchemaEditorProps) => {
  const {
    locale,
    editorId,
    schema,
    templates = [],
    schemaExtension = '.template',
    isGenerating = false,
    onSchemaUpdated,
    onGenerateDialog,
    allowUndo = false,
  } = props;

  const trackedAtoms = useRecoilValue(trackedAtomsSelector);
  const { setTemplates, reset, updateLocale, importSchemaString } = useHandlers();

  React.useEffect(() => {
    if (locale) {
      updateLocale({ locale });
    }
  }, [locale]);

  React.useEffect(() => {
    setTemplates({ templates });
  }, [templates]);

  React.useEffect(() => {
    if (templates.length) {
      importSchemaString({ ...schema, templates });
    }
  }, [editorId, templates]);

  const startOver = React.useCallback(() => {
    reset({ name: schema.id });
  }, [reset, editorId, schema]);

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
        isGenerating={isGenerating}
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
