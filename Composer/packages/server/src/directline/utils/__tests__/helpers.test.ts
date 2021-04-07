// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { statusCodeFamily } from '../helpers';

describe('Directline Helpers', () => {
  it('Mark the status code under error family', () => {
    expect(statusCodeFamily(401, 400)).toBeTruthy();
  });

  it('Mark the status code under success family', () => {
    expect(statusCodeFamily(201, 200)).toBeTruthy();
  });
});
