// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { initializeIcons } from '@uifabric/icons';
import * as React from 'react';
import { VisualSchemaEditor } from 'src/app/VisualSchemaEditor';

initializeIcons();

export const DemoApp = () => {
  const { 0: name, 1: setName } = React.useState('');
  const { 0: items, 1: setItems } = React.useState<{ id: string; content: string }[]>([]);
  const { 0: selectedItem, 1: setSelectedItem } = React.useState<{ id: string; content: string }>();

  const updateItem = React.useCallback(
    (id: string, content: string) => {
      if (selectedItem.id !== id) {
        return;
      }
      const idx = items.findIndex((i) => i.id === id);
      const newItems = items.slice();
      newItems[idx] = { id, content };
      setItems(newItems);
    },
    [selectedItem]
  );

  const addItem = React.useCallback(() => {
    const newItems = items.slice();
    newItems.push({ id: name, content: '{}' });
    setItems(newItems);
    setName('');
  }, [name]);

  return (
    <Stack horizontal verticalFill styles={{ root: { height: 'calc(100vh)' } }}>
      <Stack styles={{ root: { width: 400, padding: 16, borderRight: '1px solid' } }} tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <TextField
            styles={{ root: { flex: 1 } }}
            value={name}
            onChange={(_, newValue) => setName(newValue)}
            onKeyUp={(e) => e.key === 'Enter' && addItem()}
          ></TextField>
          <IconButton disabled={!name} iconProps={{ iconName: 'Add' }} onClick={addItem} />
        </Stack>
        {items.map((i) => (
          <Stack
            key={i.id}
            styles={{ root: { cursor: 'pointer', marginBottom: 8, height: 32 } }}
            verticalAlign="center"
            onClick={() => setSelectedItem(i)}
          >
            item: {i.id}
          </Stack>
        ))}
      </Stack>
      {selectedItem && (
        <Stack
          grow
          styles={{
            root: {
              overflowY: 'auto',
            },
          }}
        >
          <VisualSchemaEditor
            editorId={selectedItem.id}
            schema={selectedItem}
            templates={[]}
            onSchemaUpdated={updateItem}
          />
        </Stack>
      )}
    </Stack>
  );
};
