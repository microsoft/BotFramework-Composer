// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { HandlerDependencies } from 'src/app/dispatcher/types';
import {
  ArrayPropertyPayload,
  createSchemaProperty,
  NumberPropertyPayload,
  PropertyPayload,
  RefPropertyPayload,
  SchemaPropertyKind,
  StringPropertyPayload,
} from 'src/app/stores/schemaPropertyStore';
import { createSchemaStore } from 'src/app/stores/schemaStore';
import { createSchemaStoreFromJson } from 'src/app/stores/schemaUtils';
import { readFileContent } from 'src/app/utils/file';

const getDefaultPayload = (kind: SchemaPropertyKind) => {
  switch (kind) {
    case 'ref':
      return <RefPropertyPayload>{ kind: 'ref' };
    case 'string':
      return <StringPropertyPayload>{ kind: 'string', entities: [] };
    case 'number':
      return <NumberPropertyPayload>{ kind: 'number', entities: [] };
    case 'array':
      return <ArrayPropertyPayload>{ kind: 'array', items: { kind: 'string', entities: [] } };
    default:
      throw new Error(`Property type: "${kind}" is not supported!`);
  }
};

export type SchemaAction = ReturnType<typeof createSchemaHandler>;

export const createSchemaHandler = (dependencies: HandlerDependencies) => {
  const { dataStore } = dependencies;

  const importSchemaString = ({ id, content }: { id: string; content: string }) => {
    const importedSchema = createSchemaStoreFromJson(id, content);
    dataStore.setSchema(importedSchema);
  };

  const importSchema = async ({ id, file }: { id: string; file: File }) => {
    const content = await readFileContent(file);
    importSchemaString({ id, content });
  };

  const addProperty = () => {
    dataStore.schema.addProperty('string', {
      examples: [],
      name: '',
      payload: { kind: 'string' },
      required: false,
    });
  };

  const changePropertyKind = ({ id, kind }: { id: string; kind: SchemaPropertyKind }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ kind, examples: [], payload: getDefaultPayload(kind) });
  };

  const changePropertyRequired = ({ id, required }: { id: string; required: boolean }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ required });
  };

  const changePropertyName = ({ id, name }: { id: string; name: string }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ name });
  };

  const changePropertyPayload = ({ id, payload }: { id: string; payload: PropertyPayload }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ payload });
  };

  const moveProperty = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    dataStore.schema.moveProperty(fromIndex, toIndex);
  };

  const removeProperty = ({ id }: { id: string }) => {
    dataStore.schema.removeProperty(id);
  };

  const duplicateProperty = ({ id }: { id: string }) => {
    dataStore.schema.duplicateProperty(id);
  };

  const changeRef = ({ id, ref }: { id: string; ref: string }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ payload: <RefPropertyPayload>{ ref } });
  };

  const changePropertyExamples = ({ id, examples }: { id: string; examples: readonly string[] }) => {
    const property = dataStore.schema.findPropertyById(id);
    property.update({ examples: examples.slice() });
  };

  const reset = ({ name }: { name: string }) => {
    const properties = [
      createSchemaProperty('string', { name: '', payload: { kind: 'string' }, required: false, examples: [] }),
    ];
    dataStore.setSchema(createSchemaStore({ name, properties }));
  };

  return {
    importSchema,
    importSchemaString,
    addProperty,
    changePropertyKind,
    changePropertyRequired,
    changePropertyName,
    changePropertyPayload,
    changePropertyExamples,
    moveProperty,
    removeProperty,
    duplicateProperty,
    changeRef,
    reset,
  };
};
