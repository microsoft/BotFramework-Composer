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
  formDialogLibraryTemplatesState,
  formDialogSchemasState,
} from '../../recoilModel';
import { LeftRightSplit } from '../../components/Split/LeftRightSplit';

import { VisualFormDialogSchemaEditor } from './VisualFormDialogSchemaEditor';
import { FormDialogSchemaList } from './FormDialogSchemaList';
import CreateFormDialogSchemaModal from './CreateFormDialogSchemaModal';

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

type Props = RouteComponentProps<{ projectId: string; schemaId: string }>;

const FormDialogPage: React.FC<Props> = React.memo((props: Props) => {
  const { projectId = '', schemaId = '' } = props;
  const formDialogSchemas = useRecoilValue(formDialogSchemasState(projectId));
  const formDialogLibraryTemplates = useRecoilValue(formDialogLibraryTemplatesState);
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
  const { 0: selectedFormDialogSchemaId, 1: setSelectedFormDialogSchemaId } = React.useState<string>(schemaId);

  const availableTemplates = React.useMemo(
    () => formDialogLibraryTemplates.filter((t) => !t.isGlobal).map((t) => t.name),
    [formDialogLibraryTemplates]
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
      removeFormDialogSchema({ id, projectId });
      if (selectedFormDialogSchemaId === id) {
        selectItem('');
      }
    },
    [selectItem, removeFormDialogSchema, selectedFormDialogSchemaId]
  );

  const generateFormDialogs = React.useCallback(
    (schemaId: string) => {
      if (schemaId) {
        generateFormDialog({ projectId, schemaId });
      }
    },
    [generateFormDialog, projectId]
  );

  const updateItem = React.useCallback(
    (id: string, content: string) => {
      if (id === selectedFormDialogSchemaId) {
        updateFormDialogSchema({ id, content, projectId });
      }
    },
    [updateFormDialogSchema, selectedFormDialogSchemaId]
  );

  const createItem = React.useCallback(
    (formDialogName: string) => {
      createFormDialogSchema({ id: formDialogName, projectId });
      setCreateSchemaDialogOpen(false);
    },
    [createFormDialogSchema, setCreateSchemaDialogOpen]
  );

  return (
    <>
      <Stack horizontal verticalFill>
        <LeftRightSplit initialLeftGridWidth={320} minLeftPixels={320} minRightPixels={800}>
          <FormDialogSchemaList
            items={formDialogSchemas}
            loading={formDialogGenerationProgressing}
            selectedId={selectedFormDialogSchemaId}
            onCreateItem={createItemStart}
            onDeleteItem={deleteItem}
            onGenerate={generateFormDialogs}
            onSelectItem={selectItem}
          />
          {selectedFormDialogSchema ? (
            <VisualFormDialogSchemaEditor
              generationInProgress={formDialogGenerationProgressing}
              projectId={projectId}
              schema={selectedFormDialogSchema}
              templates={availableTemplates}
              onChange={updateItem}
              onGenerate={generateFormDialogs}
            />
          ) : (
            <EmptyView verticalFill />
          )}
        </LeftRightSplit>
      </Stack>
      {createSchemaDialogOpen ? (
        <CreateFormDialogSchemaModal
          isOpen={createSchemaDialogOpen}
          projectId={projectId}
          onDismiss={() => setCreateSchemaDialogOpen(false)}
          onSubmit={createItem}
        />
      ) : null}
    </>
  );
});

export default FormDialogPage;
