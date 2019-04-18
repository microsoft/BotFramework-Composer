import { JSONSchema6 } from 'json-schema';
import merge from 'lodash.merge';

const schema: JSONSchema6 = {
  title: 'Mock Schema',
};

export function generateSchema(overrides = {}): JSONSchema6 {
  return merge({}, schema, overrides);
}
