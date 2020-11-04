// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { validateDialogName } from '../../src/dialogUtils/validateDialogName';

const error = new Error(
  'Spaces and special characters are not allowed. Use letters, numbers, -, or _, and begin the name with a letter.'
);
const emptyError = new Error('The file name can not be empty');

describe('check dialog name', () => {
  it('don not support special characters', () => {
    expect(() => validateDialogName('*a')).toThrowError(error);
    expect(() => validateDialogName('c*a')).toThrowError(error);
    expect(() => validateDialogName('c a')).toThrowError(error);
    expect(() => validateDialogName('')).toThrowError(emptyError);
  });

  it('don not support number at the beginning.', () => {
    expect(() => validateDialogName('1a')).toThrowError(error);
    expect(() => validateDialogName('a1')).not.toThrowError();
  });
});
