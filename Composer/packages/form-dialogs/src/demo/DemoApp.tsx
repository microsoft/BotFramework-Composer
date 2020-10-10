// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { initializeIcons } from '@uifabric/icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { atom, atomFamily, RecoilRoot, selector, useRecoilCallback, useRecoilValue } from 'recoil';
import { FormDialogSchemaEditor } from 'src/index';

initializeIcons();

const templates = [
  'age.schema',
  'datetime.schema',
  'dimension.schema',
  'geography.schema',
  'money.schema',
  'ordinal.schema',
  'temperature.schema',
];

const sandwichContent = `
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "properties": {
      "Quantity": {
          "type": "number",
          "minimum": 1,
          "maximum": 10
      },
      "Length": {
          "$ref": "template:dimension.schema"
      },
      "Name": {
          "type": "string",
          "$entities": [
              "personName",
              "utterance"
          ]
      },
      "Bread": {
          "type": "string",
          "enum": [
              "multiGrainWheat",
              "rye",
              "white",
              "wholeWheat"
          ]
      },
      "Meat": {
          "type": "string",
          "enum": [
              "bacon",
              "chicken",
              "ham",
              "pulled pork",
              "roast beef",
              "salami",
              "turkey",
              "none"
          ]
      },
      "Cheese": {
          "type": "string",
          "enum": [
              "american",
              "cheddar",
              "feta",
              "gouda",
              "pepper jack",
              "provolone",
              "swiss",
              "none"
          ]
      },
      "Toppings": {
          "type": "array",
          "items": {
              "type": "string",
              "enum": [
                  "tomato",
                  "lettuce",
                  "pickles",
                  "greenPeppers",
                  "redPepppers",
                  "whiteOnions",
                  "redOnions"
              ],
              "maxItems": 3
          }
      },
      "Sauces": {
          "type": "array",
          "items": {
              "type": "string",
              "enum": [
                  "pepper",
                  "salt",
                  "yellowMustard",
                  "dijonMustard",
                  "mayo",
                  "vinegar"
              ]
          }
      },
      "Price": {
          "$ref": "template:money.schema"
      }
  },
  "required": [
      "Name",
      "Bread",
      "Cheese",
      "Meat",
      "Toppings",
      "Sauces",
      "Price"
  ],
  "$examples": {
      "personName": [
          "Bart Simpson",
          "Thomas Matthews",
          "Christopher Robin"
      ]
  }
}
`;

type Item = { id: string; content: string };

const storeAtom = atom<string[]>({
  key: 'store',
  default: ['sandwich'],
});

const itemNameAtom = atom({
  key: 'itemName',
  default: '',
});

const selectedItemIdAtom = atom<string>({
  key: 'selectedItemId',
  default: '',
});

const storeItemAtom = atomFamily<Item, string>({
  key: 'storeItem',
  default: { id: 'sandwich', content: sandwichContent },
});

const selectedItemAtom = selector<Item>({
  key: 'selectedItem',
  get: ({ get }) => {
    const selectedId = get(selectedItemIdAtom);
    return get(storeItemAtom(selectedId));
  },
});

const useStore = () => {
  const addItem = useRecoilCallback(({ set, snapshot }) => async (content: string) => {
    const id = await snapshot.getPromise(itemNameAtom);
    set(storeAtom, (cur) => {
      return [...cur, id];
    });
    set(storeItemAtom(id), { id, content });
  });

  const updateItem = useRecoilCallback(({ set }) => (id: string, content: string) => {
    set(storeItemAtom(id), { id, content });
  });

  const selectItem = useRecoilCallback(({ set }) => (id: string) => {
    set(selectedItemIdAtom, id);
  });

  const setNewItemName = useRecoilCallback(({ set }) => (name: string) => {
    set(itemNameAtom, name);
  });

  return { addItem, updateItem, selectItem, setNewItemName };
};

const InternalDemoApp = () => {
  const items = useRecoilValue(storeAtom);
  const selectedItemId = useRecoilValue(selectedItemIdAtom);
  const selectedItem = useRecoilValue(selectedItemAtom);
  const newItemName = useRecoilValue(itemNameAtom);
  const { addItem, selectItem, setNewItemName, updateItem } = useStore();

  const onAddItem = React.useCallback(() => {
    addItem('{}');
    setNewItemName('');
  }, []);

  const onUpdateItem = React.useCallback(
    (id: string, content: string) => {
      if (selectedItemId !== id) {
        return;
      }
      updateItem(id, content);
    },
    [selectedItemId, updateItem]
  );

  const onChangeName = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
      setNewItemName(name);
    },
    [setNewItemName]
  );

  return (
    <Stack horizontal verticalFill styles={{ root: { height: 'calc(100vh)' } }}>
      <Stack styles={{ root: { width: 400, borderRight: '1px solid' } }} tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8, padding: 16 }}>
          <TextField
            styles={{ root: { flex: 1 } }}
            value={newItemName}
            onChange={onChangeName}
            onKeyUp={(e) => e.key === 'Enter' && onAddItem()}
          ></TextField>
          <IconButton disabled={!newItemName} iconProps={{ iconName: 'Add' }} onClick={onAddItem} />
        </Stack>
        <div>
          {items.map((item) => (
            <Stack
              key={item}
              styles={{
                root: {
                  cursor: 'pointer',
                  padding: '0 16px',
                  height: 48,
                  backgroundColor: item === selectedItemId ? '#ddd' : 'transparent',
                  borderBottom: '1px solid #444',
                },
              }}
              verticalAlign="center"
              onClick={() => selectItem(item)}
            >
              {item}
            </Stack>
          ))}
        </div>
      </Stack>
      {selectedItemId && (
        <Stack
          grow
          styles={{
            root: {
              overflowY: 'auto',
            },
          }}
        >
          <FormDialogSchemaEditor
            allowUndo
            editorId={selectedItemId}
            schema={selectedItem}
            schemaExtension=".form-dialog"
            templates={templates}
            // eslint-disable-next-line no-console
            onGenerateDialog={(schema) => console.log(schema)}
            onSchemaUpdated={onUpdateItem}
          />
        </Stack>
      )}
    </Stack>
  );
};

export const DemoApp = () => {
  return (
    <RecoilRoot>
      <InternalDemoApp />
    </RecoilRoot>
  );
};
