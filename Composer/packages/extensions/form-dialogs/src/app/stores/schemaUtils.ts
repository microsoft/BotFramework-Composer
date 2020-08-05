// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

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

const $refToRef = ($ref: string) => {
  const [, ref] = $ref.match('template:(.*)');
  return ref;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const retrievePayload = (kind: SchemaPropertyKind, payloadData: any): PropertyPayload => {
  switch (kind) {
    case 'ref':
      return <RefPropertyPayload>{ ref: $refToRef(payloadData.$ref) };
    case 'string':
      return <StringPropertyPayload>{ kind: 'string', entities: payloadData.$entities, enums: payloadData.enum };
    case 'number':
      return <NumberPropertyPayload>{
        kind: 'number',
        minimum: payloadData.minimum,
        maximum: payloadData.maximum,
      };
    case 'array':
      return <ArrayPropertyPayload>{
        kind: 'array',
        items:
          payloadData.items.type === 'string'
            ? {
                ...(<StringPropertyPayload>retrievePayload(payloadData.items.type, payloadData.items)),
                maxItems: payloadData.items.maxItems,
              }
            : payloadData.items.type === 'number'
            ? {
                ...(<NumberPropertyPayload>retrievePayload(payloadData.items.type, payloadData.items)),
                maxItems: payloadData.items.maxItems,
              }
            : { ...(<StringPropertyPayload>retrievePayload('ref', payloadData.items)) },
      };
    default:
      throw new Error(`Property of type: ${kind} is not currently supported!`);
  }
};

export const createSchemaStoreFromJson = (schemaName: string, jsonString: string) => {
  const json = JSON.parse(jsonString);

  const properties = json.properties || [];
  const requiredArray = <string[]>(json.required || []);
  const examplesRecord = <Record<string, string[]>>(json.$examples || {});

  const propertyStores = Object.keys(properties).map((name) => {
    const propertyData = properties[name];

    const kind = <SchemaPropertyKind>propertyData?.type || 'ref';
    const required = requiredArray.indexOf(name) !== -1;
    const examples = examplesRecord[name];

    return createSchemaProperty(kind, {
      name,
      required,
      examples,
      payload: retrievePayload(kind, propertyData),
    });
  });

  return createSchemaStore({ name: schemaName, properties: propertyStores });
};
