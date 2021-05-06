// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { FormDialogSchemaTemplate } from '@bfc/shared';

import { PropertyCardData } from '../components/property/types';
import { generateId } from '../utils/base';
import { nameRegex } from '../utils/constants';

export const templateTypeToJsonSchemaType = (cardData: PropertyCardData, templates: FormDialogSchemaTemplate[]) => {
  const template = templates.find((t) => t.id === cardData.propertyType);
  const isRef = template.type === 'object' && template.$template;

  if (isRef) {
    return { kind: 'ref', ref: template.id };
  }

  const hasEnum = !!cardData.enum;
  if (hasEnum) {
    return { kind: 'string', enums: true };
  }

  return {
    kind: cardData.propertyType,
    format: cardData.format,
  };
};

const $refToRef = ($ref: string) => {
  const [, ref] = $ref.match(/template:(.*)\.template/);
  // Lower case is necessary because in generator parser dereferencing always converts to lower case
  return ref.toLowerCase();
};

export const jsonSchemaTypeToTemplateType = (
  propertyJson: any,
  templates: FormDialogSchemaTemplate[]
): { propertyType: string; isArray?: boolean } => {
  const jsonType = propertyJson.type ?? 'ref';

  switch (jsonType ?? 'ref') {
    case 'array': {
      return { ...jsonSchemaTypeToTemplateType(propertyJson.items, templates), isArray: true };
    }
    case 'boolean':
    case 'number':
    case 'integer':
      return { propertyType: jsonType };
    case 'string': {
      if (propertyJson.enum) {
        return { propertyType: 'enum' };
      }

      if (propertyJson.format) {
        const template = templates.find(
          (template) => template.format === propertyJson.format && template.type === jsonType
        );
        return { propertyType: template.id };
      }

      return { propertyType: 'string' };
    }
    case 'ref': {
      const ref = $refToRef(propertyJson.$ref);

      const template = templates.find((template) => template.id === ref);

      return { propertyType: template.id };
    }
    default:
      throw new Error(`${jsonType} is not supported!`);
  }
};

export const createSchemaStoreFromJson = (
  name: string,
  jsonString: string,
  templates: FormDialogSchemaTemplate[]
): { name: string; properties: PropertyCardData[] } => {
  const json = JSON.parse(jsonString);

  const propertiesJson = json.properties || [];
  const requiredArray = <string[]>(json.required || []);

  const properties = Object.keys(propertiesJson).map((name) => {
    const { $examples, ...propertyJson } = propertiesJson[name];

    const { isArray, propertyType } = jsonSchemaTypeToTemplateType(propertyJson, templates);
    const cardData = isArray ? propertyJson.items : propertyJson;
    const isRequired = requiredArray.includes(name);

    delete propertyJson.type;

    return {
      id: generateId(),
      name,
      propertyType,
      isRequired,
      isArray: !!isArray,
      $examples,
      ...cardData,
    };
  });

  return { name, properties };
};

const findFirstMissingIndex = (arr: number[], start: number, end: number): number => {
  if (start > end) return end + 1;

  if (start + 1 !== arr[start]) return start;

  const mid = Math.floor(start + (end - start) / 2);

  if (arr[mid] === mid + 1) {
    return findFirstMissingIndex(arr, mid + 1, end);
  }

  return findFirstMissingIndex(arr, start, mid);
};

export const getDuplicateName = (name: string, allNames: readonly string[]) => {
  if (!name) {
    return '';
  }

  const getBestIndex = (origName: string) => {
    const pattern = `${origName}-copy([0-9])+`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(pattern);
    const otherNames = allNames.filter((n) => regex.test(n));
    const indices: number[] = [];
    for (const otherName of otherNames) {
      try {
        const { 1: otherIdxString } = otherName.match(regex);
        const otherIdx = parseInt(otherIdxString);
        indices.push(otherIdx);
      } catch {
        continue;
      }
    }

    if (!indices.length) {
      return 1;
    }

    indices.sort((a, b) => a - b);
    const maxIdx = Math.max(...indices);

    const firstAvailableIdx = findFirstMissingIndex(indices, 0, indices.length - 1);

    return firstAvailableIdx === -1 ? maxIdx + 1 : firstAvailableIdx + 1;
  };

  const cpIndex = name.indexOf('-copy');
  const originalName = cpIndex === -1 ? name : name.substring(0, cpIndex);

  const bestIndex = getBestIndex(originalName);

  return `${originalName}-copy${bestIndex}`;
};

//----------------------------JSON spreading----------------------------

const spreadCardDataNormal = (propertyType: string, cardValues: Record<string, any>) => {
  cardValues = cardValues.items ?? cardValues;
  return {
    $ref: `template:${propertyType}.template`,
    ...cardValues,
  };
};

const spreadCardDataArray = (propertyType: string, cardValues: Record<string, any>) => {
  const wasArray = !!cardValues.items;

  return wasArray
    ? { type: 'array', ...cardValues }
    : {
        type: 'array',
        items: spreadCardDataNormal(propertyType, cardValues),
      };
};

export const spreadCardData = (cardData: PropertyCardData) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, isArray, isRequired, propertyType, name, ...cardValues } = cardData;
  const { $examples, ...restData } = cardValues;

  if (isArray) {
    return { ...spreadCardDataArray(propertyType, restData), $examples };
  }

  return { ...spreadCardDataNormal(propertyType, restData), $examples };
};

//----------------------------JSON validation----------------------------

// For now we assume all the values are optional
const shouldValidateData = false;
export const validateSchemaPropertyStore = (cardData: PropertyCardData, templates: FormDialogSchemaTemplate[]) => {
  let dataValid = true;
  if (shouldValidateData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, isArray, isRequired, name, propertyType, ...cardValues } = cardData;
    const template = templates.find((t) => t.id === propertyType);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, description, array, $examples, ...templateVariables } = template.$generator;

    for (const variable of Object.keys(templateVariables)) {
      if (cardValues[variable] === undefined) {
        dataValid = false;
      }
    }
  }

  return dataValid && cardData.name && nameRegex.test(cardData.name);
};
