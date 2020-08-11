// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Instance, SnapshotOut, types } from 'mobx-state-tree';
import { UndoManager } from 'mst-middlewares';
import { createSchemaStore, MutableSchemaStore, SchemaStore } from 'src/app/stores/schemaStore';

export type MutableDataStore = Instance<typeof DataStore>;
export type DataStore = DeepNoFunction<MutableDataStore>;

export const DataStore = types
  .model('DataStore', {
    history: types.optional(UndoManager, {}),
    schema: SchemaStore,
  })
  .actions((self) => ({
    setSchema: (schema: MutableSchemaStore) => {
      self.schema = schema;
    },
  }));

export const createDataStore = (snapshot?: SnapshotOut<MutableDataStore>) => {
  const defaultDataStore: SnapshotOut<MutableDataStore> = {
    schema: createSchemaStore(snapshot?.schema),
    history: undefined,
  };

  return snapshot ? DataStore.create({ ...defaultDataStore, ...snapshot }) : DataStore.create(defaultDataStore);
};
