// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { SnapshotIn, types, Instance } from 'mobx-state-tree';
import { generateId } from 'src/app/utils/base';

export type SchemaPropertyKind = 'ref' | 'number' | 'string' | 'array';

export type RefPropertyPayload = TypedPropertyPayload & {
  ref: string;
};

export type TypedPropertyPayload = {
  kind: SchemaPropertyKind;
  entities?: string[];
};

export type StringPropertyPayload = TypedPropertyPayload & {
  kind: 'string';
  enums?: string[];
};

export type NumberPropertyPayload = TypedPropertyPayload & {
  kind: 'number';
  minimum: number;
  maximum: number;
};

export type ArrayPropertyPayload = TypedPropertyPayload & {
  kind: 'array';
  items:
    | (NumberPropertyPayload & { maxItems?: number })
    | (StringPropertyPayload & { maxItems?: number })
    | RefPropertyPayload;
};

export type PropertyPayload = RefPropertyPayload | StringPropertyPayload | NumberPropertyPayload | ArrayPropertyPayload;

export type MutableSchemaPropertyStore = Instance<typeof SchemaPropertyStore>;
export type SchemaPropertyStore = DeepNoFunction<MutableSchemaPropertyStore>;
export type SchemaPropertyStoreData = Pick<SchemaPropertyStore, 'name' | 'payload' | 'required' | 'examples'>;

const spreadEntities = (payload: TypedPropertyPayload) =>
  payload?.entities?.length ? { $entities: payload.entities } : {};

const spreadStringSchemaProperty = (payload: StringPropertyPayload) =>
  payload?.enums?.length ? { enum: payload.enums } : {};

const spreadNumberSchemaProperty = (payload: NumberPropertyPayload) => {
  return { minimum: payload.minimum, maximum: payload.maximum };
};

const spreadRefSchemaProperty = (payload: RefPropertyPayload) => ({ $ref: `template:${payload.ref}` });

const spreadArraySchemaProperty = (payload: ArrayPropertyPayload) => {
  const helper = () => {
    switch (payload.items.kind) {
      case 'string': {
        const stringItems = <StringPropertyPayload & { maxItems?: number }>payload.items;
        return {
          type: 'string',
          maxItems: stringItems.maxItems,
          ...spreadStringSchemaProperty(<StringPropertyPayload>payload.items),
        };
      }
      case 'number': {
        const numberItems = <NumberPropertyPayload & { maxItems?: number }>payload.items;
        return {
          type: 'number',
          maxItems: numberItems.maxItems,
          ...spreadNumberSchemaProperty(<NumberPropertyPayload>payload.items),
        };
      }
      default:
      case 'ref':
        return spreadRefSchemaProperty(<RefPropertyPayload>payload.items);
    }
  };
  return {
    items: helper(),
  };
};

export const SchemaPropertyStore = types
  .model({
    id: types.string,
    name: types.string,
    kind: types.frozen<SchemaPropertyKind>(),
    payload: types.frozen<PropertyPayload>(),
    required: types.boolean,
    examples: types.array(types.string),
  })
  .views((self) => ({
    get toJson(): object {
      switch (self.kind) {
        case 'ref':
          return spreadRefSchemaProperty(<RefPropertyPayload>self.payload);
        case 'string':
          return {
            type: self.kind,
            ...spreadEntities(<TypedPropertyPayload>self.payload),
            ...spreadStringSchemaProperty(<StringPropertyPayload>self.payload),
          };
        case 'number':
          return {
            type: self.kind,
            ...spreadEntities(<TypedPropertyPayload>self.payload),
            ...spreadNumberSchemaProperty(<NumberPropertyPayload>self.payload),
          };
        case 'array':
          return {
            type: self.kind,
            ...spreadEntities(<TypedPropertyPayload>self.payload),
            ...spreadArraySchemaProperty(<ArrayPropertyPayload>self.payload),
          };
        default:
          throw new Error(`Property type: "${self.kind}" is not supported!`);
      }
    },
    get isValid(): boolean {
      let payloadValid = false;
      switch (self.kind) {
        case 'ref':
          payloadValid = !!(<RefPropertyPayload>self.payload).ref;
          break;
        case 'string': {
          const stringPayload = <StringPropertyPayload>self.payload;
          payloadValid = !!stringPayload?.enums?.length || !!stringPayload?.entities?.length;
          break;
        }
        case 'number': {
          const numberPayload = <NumberPropertyPayload>self.payload;
          payloadValid =
            !!numberPayload?.minimum && !!numberPayload?.maximum && numberPayload.minimum <= numberPayload.maximum;
          break;
        }
        case 'array': {
          const arrayPayload = <ArrayPropertyPayload>self.payload;
          payloadValid = !!arrayPayload.items;
          break;
        }
      }

      return !!(payloadValid && self.name);
    },
  }))
  .actions((self) => ({
    update: (props: Partial<Omit<SnapshotIn<typeof self>, 'id'>>) => {
      Object.assign(self, props);
    },
  }));

export const createSchemaProperty = (kind: SchemaPropertyKind, data: SchemaPropertyStoreData) => {
  const { name, required = false, examples = [], payload } = data;
  switch (kind) {
    case 'ref':
      return createRefSchemaProperty(name, required, examples.slice(), <RefPropertyPayload>payload);
    case 'string':
      return createStringSchemaProperty(name, required, examples.slice(), <StringPropertyPayload>payload);
    case 'number':
      return createNumberSchemaProperty(name, required, examples.slice(), <NumberPropertyPayload>payload);
    case 'array':
      return createArraySchemaProperty(name, required, examples.slice(), <ArrayPropertyPayload>payload);
    default:
      throw new Error(`Property type: "${kind}" is not supported!`);
  }
};

const createRefSchemaProperty = (name: string, required: boolean, examples: string[], payload: RefPropertyPayload) => {
  return SchemaPropertyStore.create({ id: generateId(), kind: 'ref', name, required, examples, payload });
};

const createStringSchemaProperty = (
  name: string,
  required: boolean,
  examples: string[],
  payload: StringPropertyPayload
) => {
  return SchemaPropertyStore.create({ id: generateId(), kind: 'string', name, required, examples, payload });
};

const createNumberSchemaProperty = (
  name: string,
  required: boolean,
  examples: string[],
  payload: NumberPropertyPayload
) => {
  return SchemaPropertyStore.create({ id: generateId(), kind: 'number', name, required, examples, payload });
};

const createArraySchemaProperty = (
  name: string,
  required: boolean,
  examples: string[],
  payload: ArrayPropertyPayload
) => {
  return SchemaPropertyStore.create({ id: generateId(), kind: 'array', name, required, examples, payload });
};
