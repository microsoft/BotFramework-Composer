#!/usr/bin/env node
/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as ppath from 'path';

import glob from 'globby';

import * as fg from './dialogGenerator';
import * as s from './schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const allof: any = require('json-schema-merge-allof');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clone = require('clone');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser: any = require('json-schema-ref-parser');

type idToSchema = { [id: string]: any };

// Get a schema after following all references and removing allOf
async function getSchema(path: string, feedback: fg.Feedback, resolver?: any): Promise<any> {
  let schema;
  try {
    const noref = await parser.dereference(path, { resolve: { template: resolver } });
    schema = allof(noref);
  } catch (err) {
    feedback(fg.FeedbackType.error, err);
  }
  return schema;
}

// All .schema files found in template directories
async function templateSchemas(templateDirs: string[], feedback: fg.Feedback): Promise<idToSchema> {
  const map: idToSchema = {};
  for (const dir of templateDirs) {
    for (const file of await glob(ppath.join(dir, '**/*.schema'))) {
      const schema = await getSchema(file, feedback);
      const id: string = schema.$id || ppath.basename(file);
      if (!map[id]) {
        // First definition found wins
        map[id] = schema;
        if (!schema.$templateDirs) {
          schema.$templateDirs = [ppath.dirname(file)];
        }
      }
    }
  }
  return map;
}

// Find recursive requires
async function findRequires(
  schema: any,
  map: idToSchema,
  found: idToSchema,
  resolver: any,
  feedback: fg.Feedback
): Promise<void> {
  const addRequired = async (required: string) => {
    if (!found[required]) {
      const schema = map[required] || (await getSchema(required, feedback, resolver));
      if (!schema) {
        feedback(fg.FeedbackType.error, `Schema ${required} cannot be found`);
      } else {
        found[required] = schema;
      }
    }
  };
  if (typeof schema === 'object') {
    for (const [child, val] of Object.entries(schema)) {
      if (child === '$requires') {
        for (const required of val as string[]) {
          await addRequired(required);
        }
      } else {
        await findRequires(val, map, found, resolver, feedback);
      }
    }
  }
}

// Merge together multiple schemas
function mergeSchemas(allSchema: any, schemas: any[]) {
  for (const schema of schemas) {
    // Merge definitions
    allSchema.properties = { ...allSchema.properties, ...schema.properties };
    allSchema.definitions = { ...allSchema.definitions, ...schema.definitions };
    if (schema.required) allSchema.required = allSchema.required.concat(schema.required);
    if (schema.$defaultOperation)
      allSchema.$defaultOperation = allSchema.$defaultOperation.concat(schema.$defaultOperation);
    if (schema.$examples) allSchema.$examples = { ...allSchema.$examples, ...schema.$examples };
    if (schema.$parameters) allSchema.$parameters = { ...allSchema.$parameters, ...schema.$parameters };
    if (schema.$expectedOnly) allSchema.$expectedOnly = allSchema.$expectedOnly.concat(schema.$expectedOnly);
    if (schema.$operations) allSchema.$operations = allSchema.$operations.concat(schema.$operations);
    if (schema.$public) allSchema.$public = allSchema.$public.concat(schema.$public);
    if (schema.$templateDirs) allSchema.$templateDirs = allSchema.$templateDirs.concat(schema.$templateDirs);
    if (schema.$templates) allSchema.$templates = allSchema.$templates.concat(schema.$templates);
  }
}

export function typeName(property: any): string {
  let type = property.type;
  let isArray = false;
  if (type === 'array') {
    property = property.items;
    type = property.type;
    isArray = true;
  }
  if (property.enum) {
    type = 'enum';
  }
  if (isArray) {
    type = type + 'Array';
  }
  return type;
}

function addMissingEntities(property: any, path: string) {
  let entities: string[] = property.$entities;
  if (!entities) {
    const type = typeName(property);
    if (type === 'number') {
      entities = [`number:${path}`, 'number'];
    } else if (type === 'integer') {
      entities = [`integer:${path}`, 'integer'];
    } else if (type === 'string') {
      entities = [path + 'Entity', 'utterance'];
    } else if (type === 'object') {
      // For objects go to leaves
      for (const childPath of Object.keys(property.properties)) {
        const child = property.properties[childPath];
        addMissingEntities(child, path + '.' + child);
      }
    } else {
      entities = [path + 'Entity'];
    }
    if (!entities) {
      entities = [];
    }
    property.$entities = entities;
  }
}

// Fill in $entities if missing
function addMissing(schema: any) {
  for (const path of Object.keys(schema.properties)) {
    const property = schema.properties[path];
    addMissingEntities(property, path);
  }
}

// Process the root schema to generate all schemas
// 1) A property can $ref to a property definition to reuse a type like address.
//    Ref resolver includes template: for referring to template files.
// 2) $requires:[] can be in a property or at the top.
//    This is handled by finding all of the referenced schemas and then merging.
export async function processSchemas(schemaPath: string, templateDirs: string[], feedback: fg.Feedback): Promise<any> {
  const allRequired = await templateSchemas(templateDirs, feedback);
  const resolver: any = {
    canRead: /template:/,
    read(file: any): any {
      const base = file.url.substring(file.url.indexOf(':') + 1);
      return allRequired[base];
    },
  };
  const formSchema = await getSchema(schemaPath, feedback, resolver);
  const required = {};
  if (!formSchema.$requires) {
    // Default to standard schema
    formSchema.$requires = ['standard.schema'];
  }
  if (!formSchema.$templateDirs) {
    // Default to including schema directory
    formSchema.$templateDirs = [ppath.resolve(ppath.dirname(schemaPath))];
  }
  await findRequires(formSchema, allRequired, required, resolver, feedback);
  const allSchema = clone(formSchema);
  addMissing(allSchema);
  if (!allSchema.required) allSchema.required = [];
  if (!allSchema.$expectedOnly) allSchema.$expectedOnly = [];
  if (!allSchema.$templates) allSchema.$templates = [];
  if (!allSchema.$operations) allSchema.$operations = [];
  if (!allSchema.$defaultOperation) allSchema.$defaultOperation = [];
  if (!allSchema.$examples) allSchema.$examples = [];
  if (!allSchema.$parameters) allSchema.$parameters = [];
  if (formSchema.$public) {
    allSchema.$public = formSchema.$public;
  } else {
    // Default to properties in root schema
    allSchema.$public = Object.keys(formSchema.properties);
  }
  mergeSchemas(allSchema, Object.values(required));

  return new s.Schema(schemaPath, allSchema);
}
