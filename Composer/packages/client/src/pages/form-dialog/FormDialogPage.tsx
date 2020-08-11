// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import {
  dispatcherState,
  formDialogGenerationProgressingState,
  formDialogSchemasState,
  formDialogTemplateSchemasState,
} from '../../recoilModel';

import { CreateFormDialogSchemaModal } from './CreateFormDialogSchemaModal';
import { FormDialogSchemaEditor } from './FormDialogSchemaEditor';
import { FormDialogSchemaList } from './FormDialogSchemaList';

const EmptyView = styled(Stack)({
  position: 'relative',
  width: '100%',
  ':after': {
    fontSize: 20,
    content: '"Select an schema to edit or create a new one"',
    position: 'absolute',
    textAlign: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.5,
  },
});

type Props = RouteComponentProps<{ projectId: string }>;

const FormDialogPage: React.FC<Props> = React.memo((props: Props) => {
  const { projectId } = props;
  const formDialogSchemas = useRecoilValue(formDialogSchemasState);
  const formDialogTemplateSchemas = useRecoilValue(formDialogTemplateSchemasState);
  const formDialogGenerationProgressing = useRecoilValue(formDialogGenerationProgressingState);
  const {
    loadFormDialogSchemaTemplates,
    removeFormDialogSchema,
    generateFormDialog,
    createFormDialogSchema,
    updateFormDialogSchema,
  } = useRecoilValue(dispatcherState);

  React.useEffect(() => {
    (async () => {
      await loadFormDialogSchemaTemplates();
    })();
  }, []);

  const { 0: createSchemaDialogOpen, 1: setCreateSchemaDialogOpen } = React.useState(false);
  const { 0: selectedFormDialogSchemaId, 1: setSelectedFormDialogSchemaId } = React.useState<string>('');

  const availableTemplates = React.useMemo(
    () => formDialogTemplateSchemas.filter((t) => !t.isGlobal).map((t) => t.name),
    [formDialogTemplateSchemas]
  );

  const selectedFormDialogSchema = React.useMemo(
    () => formDialogSchemas.find((fds) => fds.id === selectedFormDialogSchemaId),
    [formDialogSchemas, selectedFormDialogSchemaId]
  );

  const createItemStart = React.useCallback(() => setCreateSchemaDialogOpen(true), [setCreateSchemaDialogOpen]);

  const selectItem = React.useCallback(
    (id: string) => {
      setSelectedFormDialogSchemaId(id);
    },
    [setSelectedFormDialogSchemaId]
  );

  const deleteItem = React.useCallback(
    (id: string) => {
      removeFormDialogSchema({ id });
      if (selectedFormDialogSchemaId === id) {
        selectItem('');
      }
    },
    [selectItem, removeFormDialogSchema, selectedFormDialogSchemaId]
  );

  const generateFormDialogs = React.useCallback(
    (schemaName: string) => {
      generateFormDialog({ projectId, schemaName });
    },
    [generateFormDialog, projectId]
  );

  const updateItem = React.useCallback(
    (id: string, content: string) => {
      if (id === selectedFormDialogSchemaId) {
        updateFormDialogSchema({ id, content });
      }
    },
    [updateFormDialogSchema, selectedFormDialogSchemaId]
  );

  const createItem = React.useCallback(
    ({ name }: { name: string }) => {
      createFormDialogSchema({ id: name, content: JSON.stringify({}, null, 2) });
      setCreateSchemaDialogOpen(false);
    },
    [createFormDialogSchema, setCreateSchemaDialogOpen]
  );

  return (
    <>
      <Stack horizontal verticalFill>
        <FormDialogSchemaList
          items={formDialogSchemas}
          loading={formDialogGenerationProgressing}
          selectedId={selectedFormDialogSchemaId}
          onCreateItem={createItemStart}
          onDeleteItem={deleteItem}
          onGenerateFormDialogs={generateFormDialogs}
          onSelectItem={selectItem}
        />
        {selectedFormDialogSchema ? (
          <FormDialogSchemaEditor
            loading={formDialogGenerationProgressing}
            projectId={projectId}
            schema={selectedFormDialogSchema}
            templates={availableTemplates}
            onChange={updateItem}
          />
        ) : (
          <EmptyView />
        )}
      </Stack>
      {createSchemaDialogOpen ? (
        <CreateFormDialogSchemaModal
          isOpen={createSchemaDialogOpen}
          onDismiss={() => setCreateSchemaDialogOpen(false)}
          onSubmit={createItem}
        />
      ) : null}
    </>
  );
});

export default FormDialogPage;
