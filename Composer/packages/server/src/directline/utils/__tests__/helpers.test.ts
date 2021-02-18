// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { statusCodeFamily, textItem } from '../helpers';

describe('Directline Helpers', () => {
  it('Mark the status code under error family', () => {
    expect(statusCodeFamily(401, 400)).toBeTruthy();
  });

  it('Mark the status code under success family', () => {
    expect(statusCodeFamily(201, 200)).toBeTruthy();
  });

  it('should get a text item for logging', () => {
    const logItem = textItem('Error', 'Cannot connect to the bot');
    expect(logItem.type).toBe('text');
    expect(logItem.payload).toEqual({
      level: 'Error',
      text: 'Cannot connect to the bot',
    });
  });
});
