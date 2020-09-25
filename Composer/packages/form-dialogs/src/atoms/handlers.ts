// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react-hooks/rules-of-hooks */

import * as React from 'react';
import { useRecoilCallback } from 'recoil';
import {
  formDialogSchemaPropertyNamesSelector,
  formDialogPropertyAtom,
  formDialogSchemaAtom,
  formDialogTemplatesAtom,
} from 'src/atoms/appState';
import { FormDialogPropertyPayload, SchemaPropertyKind } from 'src/atoms/types';
import { createSchemaStoreFromJson, getDefaultPayload, getDuplicateName } from 'src/atoms/utils';
import { generateId } from 'src/utils/base';
import { readFileContent } from 'src/utils/file';

const getHandlers = () => {
  const importSchemaString = useRecoilCallback(({ set }) => ({ id, content }: { id: string; content: string }) => {
    const schema = createSchemaStoreFromJson(id, content);

    set(formDialogSchemaAtom, { id: schema.name, name: schema.name, propertyIds: schema.properties.map((p) => p.id) });
    schema.properties.forEach((property) => set(formDialogPropertyAtom(property.id), property));
  });

  const importSchema = useRecoilCallback(() => async ({ id, file }: { id: string; file: File }) => {
    const content = await readFileContent(file);
    importSchemaString({ id, content });
  });

  const addProperty = useRecoilCallback(({ set }) => () => {
    const newPropertyId = generateId();
    set(formDialogSchemaAtom, (currentSchema) => {
      return { ...currentSchema, propertyIds: [...currentSchema.propertyIds, newPropertyId] };
    });
    set(formDialogPropertyAtom(newPropertyId), {
      id: newPropertyId,
      kind: 'string',
      name: '',
      payload: { kind: 'string' },
      examples: [],
      required: false,
      array: false,
    });
  });

  const changePropertyKind = useRecoilCallback(
    ({ set }) => ({
      id,
      kind,
      payload,
    }: {
      id: string;
      kind: SchemaPropertyKind;
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
    ({ set }) => ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      set(formDialogSchemaAtom, (currentSchema) => {
        const propertyIds = currentSchema.propertyIds.slice();
        const newId = propertyIds[fromIndex];
        propertyIds.splice(fromIndex, 1);
        propertyIds.splice(toIndex, 0, newId);

        return { ...currentSchema, propertyIds };
      });
    }
  );

  const removeProperty = useRecoilCallback(({ set, reset }) => ({ id }: { id: string }) => {
    set(formDialogSchemaAtom, (currentSchema) => ({
      ...currentSchema,
      propertyIds: currentSchema.propertyIds.filter((pId) => pId !== id),
    }));

    reset(formDialogPropertyAtom(id));
  });

  const duplicateProperty = useRecoilCallback(({ set, snapshot }) => async ({ id }: { id: string }) => {
    const newId = generateId();

    const propertyName = (await snapshot.getPromise(formDialogPropertyAtom(id))).name;
    const propertyNames = await snapshot.getPromise(formDialogSchemaPropertyNamesSelector);
    const name = getDuplicateName(propertyName, propertyNames);

    set(formDialogSchemaAtom, (currentSchema) => {
      const propertyIds = currentSchema.propertyIds.slice();
      return { ...currentSchema, propertyIds: [...propertyIds, newId] };
    });

    const property = await snapshot.getPromise(formDialogPropertyAtom(id));
    set(formDialogPropertyAtom(newId), { ...property, name, id: newId });
  });

  const changePropertyExamples = useRecoilCallback(
    ({ set }) => ({ id, examples }: { id: string; examples: readonly string[] }) => {
      set(formDialogPropertyAtom(id), (currentProperty) => {
        return { ...currentProperty, examples: examples.slice() };
      });
    }
  );

  const reset = useRecoilCallback(({ reset, set, snapshot }) => async ({ name }: { name: string }) => {
    const schema = await snapshot.getPromise(formDialogSchemaAtom);
    schema.propertyIds.forEach((pId) => reset(formDialogPropertyAtom(pId)));
    set(formDialogSchemaAtom, { id: name, name, propertyIds: [] });
  });

  const setTemplates = useRecoilCallback(({ set }) => ({ templates }: { templates: string[] }) => {
    set(formDialogTemplatesAtom, templates);
  });

  return {
    addProperty,
    changePropertyExamples,
    changePropertyKind,
    changePropertyName,
    changePropertyPayload,
    changePropertyArray,
    changePropertyRequired,
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
