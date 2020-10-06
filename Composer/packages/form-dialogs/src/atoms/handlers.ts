// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react-hooks/rules-of-hooks */

import * as React from 'react';
import { useRecoilCallback } from 'recoil';
import {
  activePropertyIdAtom,
  allFormDialogPropertyIdsSelector,
  formDialogPropertyAtom,
  formDialogSchemaAtom,
  formDialogSchemaPropertyNamesSelector,
  formDialogTemplatesAtom,
} from 'src/atoms/appState';
import { FormDialogPropertyKind, FormDialogPropertyPayload, PropertyRequiredKind } from 'src/atoms/types';
import { createSchemaStoreFromJson, getDefaultPayload, getDuplicateName } from 'src/atoms/utils';
import { generateId } from 'src/utils/base';
import { readFileContent } from 'src/utils/file';

const getHandlers = () => {
  const importSchemaString = useRecoilCallback(({ set }) => ({ id, content }: { id: string; content: string }) => {
    const schema = createSchemaStoreFromJson(id, content);

    set(formDialogSchemaAtom, {
      id: schema.name,
      name: schema.name,
      requiredPropertyIds: schema.properties.filter((p) => p.required).map((p) => p.id),
      optionalPropertyIds: schema.properties.filter((p) => !p.required).map((p) => p.id),
    });
    schema.properties.forEach((property) => set(formDialogPropertyAtom(property.id), property));
  });

  const importSchema = useRecoilCallback(() => async ({ id, file }: { id: string; file: File }) => {
    const content = await readFileContent(file);
    importSchemaString({ id, content });
  });

  const activatePropertyId = useRecoilCallback(({ set }) => ({ id }: { id: string }) => {
    set(activePropertyIdAtom, id);
  });

  const addProperty = useRecoilCallback(({ set }) => () => {
    const newPropertyId = generateId();
    set(formDialogSchemaAtom, (currentSchema) => {
      return { ...currentSchema, requiredPropertyIds: [newPropertyId, ...currentSchema.requiredPropertyIds] };
    });
    set(formDialogPropertyAtom(newPropertyId), {
      id: newPropertyId,
      kind: 'string',
      name: '',
      payload: { kind: 'string' },
      examples: [],
      required: true,
      array: false,
    });
    activatePropertyId({ id: newPropertyId });
  });

  const changePropertyKind = useRecoilCallback(
    ({ set }) => ({
      id,
      kind,
      payload,
    }: {
      id: string;
      kind: FormDialogPropertyKind;
      payload: FormDialogPropertyPayload;
    }) => {
      set(formDialogPropertyAtom(id), (currentProperty) => {
        return { ...currentProperty, kind, examples: [], payload: payload || getDefaultPayload(kind) };
      });
    }
  );

  const changePropertyRequired = useRecoilCallback(
    ({ set }) => ({ id, required }: { id: string; required: boolean }) => {
      set(formDialogPropertyAtom(id), (currentProperty) => {
        return { ...currentProperty, required };
      });
    }
  );

  const changePropertyName = useRecoilCallback(({ set }) => ({ id, name }: { id: string; name: string }) => {
    set(formDialogPropertyAtom(id), (currentProperty) => {
      return { ...currentProperty, name };
    });
  });

  const changePropertyPayload = useRecoilCallback(
    ({ set }) => ({ id, payload }: { id: string; payload: FormDialogPropertyPayload }) => {
      set(formDialogPropertyAtom(id), (currentProperty) => {
        return { ...currentProperty, payload };
      });
    }
  );

  const changePropertyArray = useRecoilCallback(({ set }) => ({ id, isArray }: { id: string; isArray: boolean }) => {
    set(formDialogPropertyAtom(id), (currentProperty) => {
      return { ...currentProperty, array: isArray };
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
        changePropertyRequired({ id, required: source === 'optional' });
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
    const property = await snapshot.getPromise(formDialogPropertyAtom(id));

    set(formDialogSchemaAtom, (currentSchema) => ({
      ...currentSchema,
      requiredPropertyIds: property.required
        ? currentSchema.requiredPropertyIds.filter((pId) => pId !== id)
        : currentSchema.requiredPropertyIds,
      optionalPropertyIds: !property.required
        ? currentSchema.optionalPropertyIds.filter((pId) => pId !== id)
        : currentSchema.optionalPropertyIds,
    }));

    reset(formDialogPropertyAtom(id));

    const activePropertyId = await snapshot.getPromise(activePropertyIdAtom);

    if (activePropertyId === id) {
      activatePropertyId({ id: '' });
    }
  });

  const duplicateProperty = useRecoilCallback(({ set, snapshot }) => async ({ id }: { id: string }) => {
    const newId = generateId();

    const property = await snapshot.getPromise(formDialogPropertyAtom(id));
    const propertyNames = await snapshot.getPromise(formDialogSchemaPropertyNamesSelector);
    const name = getDuplicateName(property.name, propertyNames);

    set(formDialogSchemaAtom, (currentSchema) => {
      const propertyIds = (property.required
        ? currentSchema.requiredPropertyIds
        : currentSchema.optionalPropertyIds
      ).slice();

      if (property.required) {
        return { ...currentSchema, requiredPropertyIds: [...propertyIds, newId] };
      } else {
        return { ...currentSchema, optionalPropertyIds: [...propertyIds, newId] };
      }
    });

    set(formDialogPropertyAtom(newId), { ...property, name, id: newId });
    activatePropertyId({ id: newId });
  });

  const changePropertyExamples = useRecoilCallback(
    ({ set }) => ({ id, examples }: { id: string; examples: readonly string[] }) => {
      set(formDialogPropertyAtom(id), (currentProperty) => {
        return { ...currentProperty, examples: examples.slice() };
      });
    }
  );

  const reset = useRecoilCallback(({ reset, set, snapshot }) => async ({ name }: { name: string }) => {
    const propertyIds = await snapshot.getPromise(allFormDialogPropertyIdsSelector);
    propertyIds.forEach((pId) => reset(formDialogPropertyAtom(pId)));
    set(formDialogSchemaAtom, { id: name, name, requiredPropertyIds: [], optionalPropertyIds: [] });
  });

  const setTemplates = useRecoilCallback(({ set }) => ({ templates }: { templates: string[] }) => {
    set(formDialogTemplatesAtom, templates);
  });

  return {
    activatePropertyId,
    addProperty,
    changePropertyExamples,
    changePropertyKind,
    changePropertyName,
    changePropertyPayload,
    changePropertyArray,
    reset,
    setTemplates,
    removeProperty,
    duplicateProperty,
    moveProperty,
    importSchema,
    importSchemaString,
  };
};

type Handler = ReturnType<typeof getHandlers>;

export const useHandlers = () => {
  const handlerFuncsRef = React.useRef<Handler>(getHandlers());
  return { ...handlerFuncsRef.current };
};
