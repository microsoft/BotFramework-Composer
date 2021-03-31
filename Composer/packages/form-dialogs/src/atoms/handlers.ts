// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react-hooks/rules-of-hooks */

import { FormDialogSchemaTemplate } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import * as React from 'react';
import { useRecoilCallback } from 'recoil';

import { PropertyCardData } from '../components/property/types';
import { generateId } from '../utils/base';
import { readFileContent } from '../utils/file';

import {
  activePropertyIdAtom,
  allFormDialogPropertyIdsSelector,
  formDialogLocale,
  formDialogLocale as formDialogLocaleAtom,
  formDialogSchemaAtom,
  formDialogSchemaPropertyNamesSelector,
  formDialogTemplatesAtom,
  propertyCardDataAtom,
} from './appState';
import { PropertyRequiredKind } from './types';
import { createSchemaStoreFromJson, getDuplicateName } from './utils';

const getHandlers = () => {
  const importSchemaString = useRecoilCallback(
    ({ set }) => async ({
      id,
      content,
      templates,
    }: {
      id: string;
      content: string;
      templates: FormDialogSchemaTemplate[];
    }) => {
      const schema = createSchemaStoreFromJson(id, content, templates);

      set(formDialogSchemaAtom, {
        id: schema.name,
        name: schema.name,
        requiredPropertyIds: schema.properties.filter((p) => p.isRequired).map((p) => p.id),
        optionalPropertyIds: schema.properties.filter((p) => !p.isRequired).map((p) => p.id),
      });
      schema.properties.forEach((property) => set(propertyCardDataAtom(property.id), property));
    }
  );

  const importSchema = useRecoilCallback(({ snapshot }) => async ({ id, file }: { id: string; file: File }) => {
    const templates = await snapshot.getPromise(formDialogTemplatesAtom);
    const content = await readFileContent(file);

    importSchemaString({ id, content, templates });
  });

  const activatePropertyId = useRecoilCallback(({ set }) => ({ id }: { id: string }) => {
    set(activePropertyIdAtom, id);
  });

  const addProperty = useRecoilCallback(({ set }) => () => {
    const newPropertyId = generateId();
    set(formDialogSchemaAtom, (currentSchema) => {
      return { ...currentSchema, requiredPropertyIds: [...currentSchema.requiredPropertyIds, newPropertyId] };
    });
    set(propertyCardDataAtom(newPropertyId), {
      id: newPropertyId,
      propertyType: 'string',
      name: '',
      isArray: false,
      isRequired: true,
    });
    activatePropertyId({ id: newPropertyId });
  });

  const changePropertyType = useRecoilCallback(
    ({ set }) => ({ id, propertyType }: { id: string; propertyType: string }) => {
      set(propertyCardDataAtom(id), (currentPropertyCardData) => {
        const basicCardData = pick(currentPropertyCardData, ['id', 'name', 'isRequired', 'isArray']);
        return { ...basicCardData, propertyType };
      });
    }
  );

  const changePropertyRequired = useRecoilCallback(
    ({ set }) => ({ id, isRequired }: { id: string; isRequired: boolean }) => {
      set(propertyCardDataAtom(id), (currentPropertyCardData) => {
        return { ...currentPropertyCardData, isRequired };
      });
    }
  );

  const changePropertyName = useRecoilCallback(
    ({ set, snapshot }) => async ({ id, name }: { id: string; name: string }) => {
      const locale = await snapshot.getPromise(formDialogLocale);
      set(propertyCardDataAtom(id), (currentPropertyCardData) => {
        const currentName = currentPropertyCardData.name;
        const cardData = { ...currentPropertyCardData, name } as PropertyCardData;

        // Change the name of the entity for examples if the type is enum
        if (cardData.propertyType === 'enum' && cardData.$examples?.[locale]?.[`${currentName}Value`]) {
          const examples = cloneDeep(cardData.$examples);
          examples[locale][`${name}Value`] = { ...examples[locale][`${currentName}Value`] };
          delete examples[locale][`${currentName}Value`];

          cardData.$examples = examples;
        }

        return cardData;
      });
    }
  );

  const changePropertyCardData = useRecoilCallback(
    ({ set, snapshot }) => async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const locale = await snapshot.getPromise(formDialogLocale);
      set(propertyCardDataAtom(id), (currentPropertyCardData) => {
        const hadEnum = !!currentPropertyCardData.enum?.length;
        const cardData = { ...currentPropertyCardData, ...data } as PropertyCardData;

        if (cardData.propertyType === 'enum') {
          // If $examples is empty, deleted current locale examples
          if (hadEnum && !cardData.$examples?.[locale]) {
            return cardData;
          }

          const defaultExamples = {
            [locale]: {
              [`${cardData.name}Value`]: (cardData?.enum ?? []).reduce((acc, e) => {
                acc[e] = [];
                return acc;
              }, {}),
            },
          };

          const newExamples = data?.$examples?.[locale]?.[`${cardData.name}Value`] ? data.$examples : defaultExamples;
          const oldExamples = currentPropertyCardData?.$examples?.[locale]?.[`${cardData.name}Value`]
            ? currentPropertyCardData.$examples
            : defaultExamples;

          // Merge default, old and new and only keep the examples for current enum values
          const mergedExamples = pick(
            merge(defaultExamples, newExamples, oldExamples),
            cardData.enum.map((e: string) => `${locale}.${cardData.name}Value.${e}`)
          );
          cardData.$examples = mergedExamples;

          return cardData;
        }

        return cardData;
      });
    }
  );

  const changePropertyArray = useRecoilCallback(({ set }) => ({ id, isArray }: { id: string; isArray: boolean }) => {
    set(propertyCardDataAtom(id), (currentPropertyCardData) => {
      return { ...currentPropertyCardData, isArray: isArray };
    });
  });

  const moveProperty = useRecoilCallback(
    ({ set }) => ({
      id,
      source,
      destination,
      fromIndex,
      toIndex,
    }: {
      id: string;
      source: PropertyRequiredKind;
      destination: PropertyRequiredKind;
      fromIndex: number;
      toIndex: number;
    }) => {
      const toggleRequired = source !== destination;

      if (toggleRequired) {
        changePropertyRequired({ id, isRequired: source === 'optional' });
      }

      set(formDialogSchemaAtom, (currentSchema) => {
        if (toggleRequired) {
          //Move between two lists
          const requiredPropertyIds = currentSchema.requiredPropertyIds.slice();
          const optionalPropertyIds = currentSchema.optionalPropertyIds.slice();

          if (source === 'required') {
            requiredPropertyIds.splice(fromIndex, 1);
            optionalPropertyIds.splice(toIndex, 0, id);
          } else {
            optionalPropertyIds.splice(fromIndex, 1);
            requiredPropertyIds.splice(toIndex, 0, id);
          }

          return { ...currentSchema, requiredPropertyIds, optionalPropertyIds };
        } else {
          // Move within a list
          const propertyIds = (source === 'required'
            ? currentSchema.requiredPropertyIds
            : currentSchema.optionalPropertyIds
          ).slice();

          propertyIds.splice(fromIndex, 1);
          propertyIds.splice(toIndex, 0, id);

          return source === 'required'
            ? { ...currentSchema, requiredPropertyIds: propertyIds }
            : { ...currentSchema, optionalPropertyIds: propertyIds };
        }
      });
    }
  );

  const removeProperty = useRecoilCallback(({ set, reset, snapshot }) => async ({ id }: { id: string }) => {
    const property = await snapshot.getPromise(propertyCardDataAtom(id));

    set(formDialogSchemaAtom, (currentSchema) => ({
      ...currentSchema,
      requiredPropertyIds: property.isRequired
        ? currentSchema.requiredPropertyIds.filter((pId) => pId !== id)
        : currentSchema.requiredPropertyIds,
      optionalPropertyIds: !property.isRequired
        ? currentSchema.optionalPropertyIds.filter((pId) => pId !== id)
        : currentSchema.optionalPropertyIds,
    }));

    reset(propertyCardDataAtom(id));

    const activePropertyId = await snapshot.getPromise(activePropertyIdAtom);

    if (activePropertyId === id) {
      activatePropertyId({ id: '' });
    }
  });

  const duplicateProperty = useRecoilCallback(({ set, snapshot }) => async ({ id }: { id: string }) => {
    const newId = generateId();

    const propertyCardData = await snapshot.getPromise(propertyCardDataAtom(id));
    const propertyNames = await snapshot.getPromise(formDialogSchemaPropertyNamesSelector);
    const name = getDuplicateName(propertyCardData.name, propertyNames);

    set(formDialogSchemaAtom, (currentSchema) => {
      const propertyIds = (propertyCardData.isRequired
        ? currentSchema.requiredPropertyIds
        : currentSchema.optionalPropertyIds
      ).slice();

      if (propertyCardData.isRequired) {
        return { ...currentSchema, requiredPropertyIds: [...propertyIds, newId] };
      } else {
        return { ...currentSchema, optionalPropertyIds: [...propertyIds, newId] };
      }
    });

    set(propertyCardDataAtom(newId), { ...cloneDeep(propertyCardData), name, id: newId });
    activatePropertyId({ id: newId });
  });

  const reset = useRecoilCallback(({ reset, set, snapshot }) => async ({ name }: { name: string }) => {
    const propertyIds = await snapshot.getPromise(allFormDialogPropertyIdsSelector);
    propertyIds.forEach((pId) => reset(propertyCardDataAtom(pId)));
    set(formDialogSchemaAtom, { id: name, name, requiredPropertyIds: [], optionalPropertyIds: [] });
  });

  const setTemplates = useRecoilCallback(({ set }) => ({ templates }: { templates: FormDialogSchemaTemplate[] }) => {
    set(formDialogTemplatesAtom, templates);
  });

  const updateLocale = useRecoilCallback(({ set }) => ({ locale }: { locale: string }) => {
    set(formDialogLocaleAtom, locale);
  });

  return {
    activatePropertyId,
    addProperty,
    changePropertyType,
    changePropertyName,
    changePropertyCardData,
    changePropertyArray,
    reset,
    setTemplates,
    removeProperty,
    duplicateProperty,
    moveProperty,
    importSchema,
    importSchemaString,
    updateLocale,
  };
};

type Handler = ReturnType<typeof getHandlers>;

export const useHandlers = () => {
  const handlerFuncsRef = React.useRef<Handler>(getHandlers());
  return { ...handlerFuncsRef.current };
};
