// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { detach, Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree';
import {
  createSchemaProperty,
  SchemaPropertyKind,
  SchemaPropertyStore,
  SchemaPropertyStoreData,
} from 'src/app/stores/schemaPropertyStore';
import { generateId } from 'src/app/utils/base';

// tslint:disable-next-line: no-http-string
const schemaDraftUrl = 'http://json-schema.org/draft-07/schema';

export type MutableSchemaStore = Instance<typeof SchemaStore>;
export type SchemaStore = DeepNoFunction<MutableSchemaStore>;

export const SchemaStore = types
  .model({
    name: types.string,
    properties: types.array(SchemaPropertyStore),
  })
  .views((self) => ({
    get prettyTimestamp() {
      return self.name;
    },
    get toJson() {
      let jsonObject: object = {
        schema: schemaDraftUrl,
        type: 'object',
        $requires: ['standard.schema'],
      };

      if (self.properties.length) {
        jsonObject = {
          ...jsonObject,
          properties: self.properties
            .filter((p) => p.isValid)
            .reduce<Record<string, object>>((acc, curr) => {
              acc[curr.name] = curr.spreadSelf;
              return acc;
            }, <Record<string, object>>{}),
        };
      }

      const required = self.properties.filter((p) => p.required).map((p) => p.name);
      const examples = self.properties.reduce<Record<string, string[]>>((acc, curr) => {
        if (curr.examples?.length) {
          acc[curr.name] = curr.examples;
        }
        return acc;
      }, <Record<string, string[]>>{});

      if (required.length) {
        jsonObject = { ...jsonObject, required };
      }

      if (Object.keys(examples)?.length) {
        jsonObject = { ...jsonObject, $examples: examples };
      }

      return JSON.stringify(jsonObject, null, 2);
    },
    get isValid() {
      return self.properties.every((p) => p.isValid);
    },
  }))
  .actions((self) => ({
    update: (props: Partial<Pick<SnapshotIn<typeof self>, 'name' | 'properties'>>) => {
      Object.assign(self, props);
    },
    addProperty: (kind: SchemaPropertyKind, data: SchemaPropertyStoreData) => {
      self.properties.push(createSchemaProperty(kind, data));
    },
    removeProperty: (propertyId: string) => {
      const idx = self.properties.findIndex((t) => t.id === propertyId);
      self.properties.splice(idx, 1);
    },
    moveProperty: (fromIdx: number, toIdx: number) => {
      const f = detach(self.properties[fromIdx]);
      self.properties.splice(toIdx, 0, f);
    },
    duplicateProperty: (propertyId: string) => {
      const { kind, ...rest } = self.properties.find((t) => t.id === propertyId);
      const clonedProperty = createSchemaProperty(kind, { ...rest, name: '' });
      self.properties.push(clonedProperty);
    },
  }));

export const createSchemaStore = (snapshot?: SnapshotOut<MutableSchemaStore>) => {
  const defaultSchemaStore: SnapshotOut<MutableSchemaStore> = {
    name: generateId(),
    properties: [],
  };

  return snapshot ? SchemaStore.create({ ...defaultSchemaStore, ...snapshot }) : SchemaStore.create(defaultSchemaStore);
};
