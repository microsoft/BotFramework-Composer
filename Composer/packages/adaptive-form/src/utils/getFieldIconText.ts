// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getFieldIconText = (type: any): string | undefined => {
  const typeFormatted = Array.isArray(type) ? type[0] : type;
  if (typeFormatted === 'string') {
    return 'abc';
  } else if (typeFormatted === 'number' || typeFormatted === 'integer') {
    return '123';
  } else if (typeFormatted === 'array') {
    return '[ ]';
  } else if (typeFormatted === 'object') {
    return '{ }';
  } else if (typeFormatted === 'boolean') {
    return 'y/n';
  } else if (typeFormatted === 'expression') {
    return '=';
  }
};
