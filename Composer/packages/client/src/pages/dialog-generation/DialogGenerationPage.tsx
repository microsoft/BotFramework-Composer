// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { useStoreContext } from '../../hooks/useStoreContext';

import { CreateSchemaDialogModal } from './CreateDialogSchemaModal';
import { SchemaEditor } from './SchemaEditor';
import { SchemaList } from './SchemaList';

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

type Props = RouteComponentProps<{}> & {
  projectId: string;
};

const DialogGenerationPage: React.FC<Props> = (props: Props) => {
  const { projectId } = props;
  const {
    actions,
    state: { dialogSchemas },
  } = useStoreContext();

  const { 0: createSchemaDialogOpen, 1: setCreateSchemaDialogOpen } = React.useState(false);
  const { 0: dialogSchema, 1: setDialogSchema } = React.useState<{ id: string; content: string }>();

  const selectItem = React.useCallback(
    (id: string) => {
      const selected = dialogSchemas.find((ds) => ds.id === id);
      setDialogSchema(selected);
    },
    [dialogSchemas]
  );

  const deleteItem = React.useCallback(
    (id: string) => {
      actions.removeDialogSchema({ id });
      if (dialogSchema?.id === id) {
        selectItem('');
      }
    },
    [dialogSchema]
  );

  const updateItem = (id: string, content: string) => {
    if (id === dialogSchema?.id) {
      actions.updateDialogSchema({ id, content });
      setDialogSchema({ ...dialogSchema, content });
    }
  };

  const createItem = React.useCallback(({ name }: { name: string }) => {
    actions.createDialogSchema({ id: name, content: JSON.stringify({}, null, 2) });
    setCreateSchemaDialogOpen(false);
  }, []);

  return (
    <>
      <Stack horizontal verticalFill>
        <SchemaList
          items={dialogSchemas
            .map((ds) => ({ id: ds.id }))
            .sort((a, b) => (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1))}
          selectedId={dialogSchema?.id}
          onCreateItem={() => setCreateSchemaDialogOpen(true)}
          onDeleteItem={deleteItem}
          onSelectItem={selectItem}
        />
        {dialogSchema ? (
          <SchemaEditor projectId={projectId} schema={dialogSchema} onChange={updateItem} />
        ) : (
          <EmptyView />
        )}
      </Stack>
      {createSchemaDialogOpen ? (
        <CreateSchemaDialogModal
          isOpen={createSchemaDialogOpen}
          onDismiss={() => setCreateSchemaDialogOpen(false)}
          onSubmit={createItem}
        />
      ) : null}
    </>
  );
};

export default DialogGenerationPage;
