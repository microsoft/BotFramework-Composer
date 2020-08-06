// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { useStoreContext } from '../../hooks/useStoreContext';

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

const FormDialogPage: React.FC<Props> = (props: Props) => {
  const { projectId } = props;
  const {
    actions,
    state: { formDialogSchemas, formDialogTemplateSchemas, formDialogGenerationProgressing },
  } = useStoreContext();

  React.useEffect(() => {
    (async () => {
      await actions.loadFormDialogSchemaTemplates();
    })();
  }, []);

  const { 0: createSchemaDialogOpen, 1: setCreateSchemaDialogOpen } = React.useState(false);
  const { 0: dialogSchema, 1: setDialogSchema } = React.useState<{ id: string; content: string }>();

  const selectItem = React.useCallback(
    (id: string) => {
      const selected = formDialogSchemas.find((ds) => ds.id === id);
      setDialogSchema(selected);
    },
    [formDialogSchemas]
  );

  const deleteItem = React.useCallback(
    (id: string) => {
      actions.removeFormDialogSchema({ id });
      if (dialogSchema?.id === id) {
        selectItem('');
      }
    },
    [dialogSchema]
  );

  const generateFormDialogs = React.useCallback((schemaName: string) => {
    actions.generateFormDialog({ schemaName });
  }, []);

  const updateItem = React.useCallback(
    (id: string, content: string) => {
      if (id === dialogSchema?.id) {
        actions.updateFormDialogSchema({ id, content });
        setDialogSchema({ ...dialogSchema, content });
      }
    },
    [dialogSchema, setDialogSchema]
  );

  const createItem = React.useCallback(({ name }: { name: string }) => {
    actions.createFormDialogSchema({ id: name, content: JSON.stringify({}, null, 2) });
    setCreateSchemaDialogOpen(false);
  }, []);

  return (
    <>
      <Stack horizontal verticalFill>
        <FormDialogSchemaList
          items={formDialogSchemas.slice().sort((a, b) => (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1))}
          loading={formDialogGenerationProgressing}
          selectedId={dialogSchema?.id}
          onCreateItem={() => setCreateSchemaDialogOpen(true)}
          onDeleteItem={deleteItem}
          onGenerateFormDialogs={generateFormDialogs}
          onSelectItem={selectItem}
        />
        {dialogSchema ? (
          <FormDialogSchemaEditor
            loading={formDialogGenerationProgressing}
            projectId={projectId}
            schema={dialogSchema}
            templates={formDialogTemplateSchemas.filter((t) => !t.isGlobal).map((t) => t.name)}
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
};

export default FormDialogPage;
