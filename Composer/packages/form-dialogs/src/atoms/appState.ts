// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { atom, atomFamily, RecoilState, selector, selectorFamily } from 'recoil';
import { FormDialogProperty, FormDialogSchema } from 'src/atoms/types';
import { spreadSchemaPropertyStore, validateSchemaPropertyStore } from 'src/atoms/utils';

const schemaDraftUrl = 'http://json-schema.org/draft-07/schema';

/**
 * This atom represents a form dialog schema.
 */
export const formDialogSchemaAtom = atom<FormDialogSchema>({
  key: 'FormDialogSchemaAtom',
  default: {
    id: '',
    name: '',
    requiredPropertyIds: [],
    optionalPropertyIds: [],
  },
});

/**
 * This atom family represent a form dialog schema property.
 */
export const formDialogPropertyAtom = atomFamily<FormDialogProperty, string>({
  key: 'FormDialogPropertyAtom',
  default: (id) => ({
    id,
    name: '',
    kind: 'string',
    payload: { kind: 'string' },
    required: true,
    array: false,
    examples: [],
  }),
});

/**
 * This selector separates required and optional properties within a form dialog schema.
 */
export const allFormDialogPropertyIdsSelector = selector<string[]>({
  key: 'RequiredFormDialogPropertyIdsSelector',
  get: ({ get }) => {
    const { requiredPropertyIds, optionalPropertyIds } = get(formDialogSchemaAtom);
    return [...requiredPropertyIds, ...optionalPropertyIds];
  },
});

/**
 * This selector computes the names of all properties within a form dialog schema.
 */
export const formDialogSchemaPropertyNamesSelector = selector<string[]>({
  key: 'FormDialogSchemaPropertyNamesSelector',
  get: ({ get }) => {
    const propertyIds = get(allFormDialogPropertyIdsSelector);
    return propertyIds.map((pId) => get(formDialogPropertyAtom(pId)).name);
  },
});

/**
 * This selector computes the json representing a form dialog property.
 */
export const formDialogPropertyJsonSelector = selectorFamily<object, string>({
  key: 'FormDialogPropertyJsonSelector',
  get: (id) => ({ get }) => {
    const schemaPropertyStore = get(formDialogPropertyAtom(id));
    return spreadSchemaPropertyStore(schemaPropertyStore);
  },
});

/**
 * This selector computes if a form dialog property is valid.
 */
export const formDialogPropertyValidSelector = selectorFamily<boolean, string>({
  key: 'FormDialogPropertyValidSelector',
  get: (id) => ({ get }) => {
    const schemaPropertyStore = get(formDialogPropertyAtom(id));
    return validateSchemaPropertyStore(schemaPropertyStore);
  },
});

/**
 * This selector computes if a form dialog schema is valid.
 */
export const formDialogSchemaValidSelector = selector({
  key: 'FormDialogSchemaValidSelector',
  get: ({ get }) => {
    const propertyIds = get(allFormDialogPropertyIdsSelector);
    return propertyIds.every((pId) => get(formDialogPropertyValidSelector(pId)));
  },
});

/**
 * This selector computes the json representing a form dialog schema.
 */
export const formDialogSchemaJsonSelector = selector({
  key: 'FormDialogSchemaJsonSelector',
  get: ({ get }) => {
    const propertyIds = get(allFormDialogPropertyIdsSelector);
    const schemaPropertyStores = propertyIds.map((pId) => get(formDialogPropertyAtom(pId)));

    let jsonObject: object = {
      schema: schemaDraftUrl,
      type: 'object',
      $requires: ['standard.schema'],
    };

    if (schemaPropertyStores.length) {
      jsonObject = {
        ...jsonObject,
        properties: propertyIds.reduce<Record<string, object>>((acc, propId, idx) => {
          const property = schemaPropertyStores[idx];
          acc[property.name] = get(formDialogPropertyJsonSelector(propId));
          return acc;
        }, <Record<string, object>>{}),
      };
    }

    const required = schemaPropertyStores.filter((property) => property.required).map((property) => property.name);
    const examples = schemaPropertyStores.reduce<Record<string, string[]>>((acc, property) => {
      if (property.examples?.length) {
        acc[property.name] = property.examples;
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
});

/**
 * This atom represents the list of the available templates.
 */
export const formDialogTemplatesAtom = atom<string[]>({
  key: 'FormDialogTemplatesAtom',
  default: [],
});

export const activePropertyIdAtom = atom<string>({
  key: 'ActivePropertyIdAtom',
  default: '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackedAtomsSelector = selector<RecoilState<any>[]>({
  key: 'TrackedAtoms',
  get: ({ get }) => {
    const propIds = get(allFormDialogPropertyIdsSelector) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [formDialogSchemaAtom, activePropertyIdAtom, ...propIds.map((pId) => formDialogPropertyAtom(pId))];
  },
});
