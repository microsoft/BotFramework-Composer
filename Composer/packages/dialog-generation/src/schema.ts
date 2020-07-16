#!/usr/bin/env node
/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* tslint:disable:no-unused */
import * as os from 'os';
import * as ppath from 'path';

import * as ajv from 'ajv';

import * as ps from './processSchemas';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const allof: any = require('json-schema-merge-allof');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser: any = require('json-schema-ref-parser');

export enum EntityType {
  simple,
  list,
  prebuilt,
}

export interface ListEntry {
  value: string;
  synonyms: string;
}

export class Entity {
  name: string;
  property: string;
  values?: ListEntry[];

  constructor(name: string, property: string) {
    this.name = name;
    this.property = property;
  }
}

//type EntitySet = Record<string, Entity>;

/**
 * Extra properties:
 * $entities: [entity] defaults based on type, string -> [property], numbers -> [property, number]
 * $templates: Template basenames to specialize for this property.
 */
export class Schema {
  /**
   * Read and validate schema from a path.
   * @param schemaPath URL for schema.
   */
  static async readSchema(schemaPath: string): Promise<Schema> {
    const noref = await parser.dereference(schemaPath);
    const schema = allof(noref);
    const validator = new ajv.default();
    if (!validator.validateSchema(schema)) {
      let message = '';
      for (const error in validator.errors) {
        message = message + error + os.EOL;
      }
      throw new Error(message);
    }
    if (schema.type !== 'object') {
      throw new Error('Root schema must be of type object.');
    }
    return new Schema(schemaPath, schema);
  }

  static basename(loc: string): string {
    const name = ppath.basename(loc);
    return name.substring(0, name.indexOf('.'));
  }

  /**
   * Path to this schema definition.
   */
  path: string;

  /**
   * Schema definition.  This is the content of a properties JSON Schema object.
   */
  schema: any;

  /**
   * Source of schema
   */
  source: string;

  constructor(source: string, schema: any, path?: string) {
    this.source = source;
    this.path = path || '';
    this.schema = schema;
  }

  name(): string {
    return Schema.basename(this.source);
  }

  *schemaProperties(): Iterable<Schema> {
    for (const prop in this.schema.properties) {
      const newPath = this.path + (this.path === '' ? '' : '.') + prop;
      yield new Schema(this.source, this.schema.properties[prop], newPath);
    }
  }

  typeName(): string {
    return ps.typeName(this.schema);
  }

  triggerIntent(): string {
    return this.schema.$triggerIntent || this.name();
  }

  /**
   * Return all entities found in schema.
   */
  allEntities(): Entity[] {
    const entities: Entity[] = [];
    this.addEntities(entities);
    return entities;
  }

  /**
   * Return all of the entity types in schema.
   */
  entityTypes(): string[] {
    const found: string[] = [];
    for (const entity of this.allEntities()) {
      const [entityName] = entity.name.split(':');
      if (!found.includes(entityName)) {
        found.push(entityName);
      }
    }
    return found;
  }

  private addEntities(entities: Entity[]) {
    if (this.schema.$entities) {
      for (const entity of this.schema.$entities) {
        // Do not include entities generated from property
        // eslint-disable-next-line no-prototype-builtins
        if (!entities.hasOwnProperty(entity)) {
          const entityWrapper = new Entity(entity, this.path);
          entities.push(entityWrapper);
        }
      }
    } else {
      // Don't explore properties below an explicit mapping
      for (const prop of this.schemaProperties()) {
        prop.addEntities(entities);
      }
    }
  }
}
