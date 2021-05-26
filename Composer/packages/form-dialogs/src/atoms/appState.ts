// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { FormDialogSchemaTemplate } from '@bfc/shared';
import { atom, atomFamily, RecoilState, selector, selectorFamily } from 'recoil';

import { PropertyCardData } from '../components/property/types';

import { FormDialogSchema } from './types';
import { spreadCardData, validateSchemaPropertyStore } from './utils';

const schemaDraftUrl = 'http://json-schema.org/draft-07/schema';

/**
 * Locale
 */
export const formDialogLocale = atom<string>({
  key: 'FormDialogLocale',
  default: '',
});

/**
 * This atom represents the list of the available templates.
 */
export const formDialogTemplatesAtom = atom<FormDialogSchemaTemplate[]>({
  key: 'FormDialogTemplatesAtom',
  default: [],
});

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
 * This atom family represent a form dialog schema property card data.
 */
export const propertyCardDataAtom = atomFamily<PropertyCardData, string>({
  key: 'PropertyCardDataAtom',
  default: (id) => ({
    id,
    name: '',
    isArray: false,
    isRequired: true,
    propertyType: 'string',
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
    return propertyIds.map((pId) => get(propertyCardDataAtom(pId)).name);
  },
});

/**
 * This selector computes the json representing a form dialog property.
 */
export const formDialogPropertyJsonSelector = selectorFamily<object, string>({
  key: 'FormDialogPropertyJsonSelector',
  get: (id) => ({ get }) => {
    const cardData = get(propertyCardDataAtom(id));
    return spreadCardData(cardData);
  },
});

/**
 * This selector computes if a form dialog property is valid.
 */
export const formDialogPropertyValidSelector = selectorFamily<boolean, string>({
  key: 'FormDialogPropertyValidSelector',
  get: (id) => ({ get }) => {
    const templates = get(formDialogTemplatesAtom);
    const cardData = get(propertyCardDataAtom(id));
    return validateSchemaPropertyStore(cardData, templates);
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
    const propertyCards = propertyIds.map((pId) => get(propertyCardDataAtom(pId)));

    let jsonObject: object = {
      $schema: schemaDraftUrl,
      type: 'object',
    };

    if (propertyCards.length) {
      jsonObject = {
        ...jsonObject,
        properties: propertyIds.reduce<Record<string, object>>((acc, propId, idx) => {
          const property = propertyCards[idx];
          acc[property.name] = get(formDialogPropertyJsonSelector(propId));
          return acc;
        }, <Record<string, object>>{}),
      };
    }

    const required = propertyCards.filter((property) => property.isRequired).map((property) => property.name);

    if (required.length) {
      jsonObject = { ...jsonObject, required };
    }

    return JSON.stringify(jsonObject, null, 2);
  },
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
    return [formDialogSchemaAtom, activePropertyIdAtom, ...propIds.map((pId) => propertyCardDataAtom(pId))];
  },
});
