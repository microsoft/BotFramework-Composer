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
          properties: self.properties.reduce<Record<string, object>>((acc, _, idx) => {
            acc[self.properties[idx].name] = self.properties[idx].toJson;
            return acc;
          }, <Record<string, object>>{}),
        };
      }

      const required = self.properties
        .filter((_, idx) => self.properties[idx].required)
        .map((_, idx) => self.properties[idx].name);
      const examples = self.properties.reduce<Record<string, string[]>>((acc, _, idx) => {
        if (self.properties[idx].examples?.length) {
          acc[self.properties[idx].name] = self.properties[idx].examples;
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
    findPropertyById: (propId: string) => {
      const idx = self.properties.findIndex((p) => p.id === propId);
      return self.properties[idx];
    },
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
      const idx = self.properties.findIndex((t) => t.id === propertyId);
      const { kind, ...rest } = self.properties[idx];
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
