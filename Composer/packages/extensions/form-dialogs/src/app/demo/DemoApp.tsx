// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { initializeIcons } from '@uifabric/icons';
import * as React from 'react';
import { VisualSchemaEditor } from 'src/app/VisualSchemaEditor';
import { useLocalStore, observer } from 'mobx-react';
import { action } from 'mobx';

initializeIcons();

type Item = { id: string; content: string };
type Store = {
  items: Item[];
  selectedItemId: string;
  selectedItem: Item;
  newItemName: string;
  setNewItemName: (name: string) => void;
  selectItem: (id: string) => void;
  addItem: (content: string) => void;
  updateItem: (id: string, content: string) => void;
};

export const DemoApp = observer(() => {
  const store = useLocalStore<Store>(() => ({
    items: [],
    newItemName: '',
    selectedItemId: '',
    get selectedItem() {
      const idx = this.items.findIndex((i) => i.id === this.selectedItemId);
      return this.items[idx];
    },
    setNewItemName: action((name: string) => {
      store.newItemName = name;
    }),
    selectItem: action((id: string) => {
      store.selectedItemId = id;
    }),
    addItem: action((content: string) => {
      store.items.push({ id: store.newItemName, content });
    }),
    updateItem: action((id: string, content: string) => {
      const idx = store.items.findIndex((i) => i.id === id);
      store.items[idx].content = content;
    }),
  }));

  const updateItem = React.useCallback(
    (id: string, content: string) => {
      if (store.selectedItemId !== id) {
        return;
      }
      store.updateItem(id, content);
    },
    [store.selectedItemId]
  );

  const addItem = React.useCallback(() => {
    store.addItem('{}');
  }, []);

  return (
    <Stack horizontal verticalFill styles={{ root: { height: 'calc(100vh)' } }}>
      <Stack styles={{ root: { width: 400, padding: 16, borderRight: '1px solid' } }} tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <TextField
            styles={{ root: { flex: 1 } }}
            value={store.newItemName}
            onChange={(_, newValue) => store.setNewItemName(newValue)}
            onKeyUp={(e) => e.key === 'Enter' && addItem()}
          ></TextField>
          <IconButton disabled={!name} iconProps={{ iconName: 'Add' }} onClick={addItem} />
        </Stack>
        {store.items.map((i) => (
          <Stack
            key={i.id}
            styles={{ root: { cursor: 'pointer', marginBottom: 8, height: 32 } }}
            verticalAlign="center"
            onClick={() => store.selectItem(i.id)}
          >
            {i.id}
          </Stack>
        ))}
      </Stack>
      {store.selectedItem && (
        <Stack
          grow
          styles={{
            root: {
              overflowY: 'auto',
            },
          }}
        >
          <VisualSchemaEditor
            editorId={store.selectedItem.id}
            schema={store.selectedItem}
            templates={[]}
            onSchemaUpdated={updateItem}
          />
        </Stack>
      )}
    </Stack>
  );
});
