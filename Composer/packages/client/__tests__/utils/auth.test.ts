// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isTokenExpired } from '../../src/utils/auth';

// token that expires on Sep 5, 2019 @ 14:00 PDT
const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Njc3MTcyMDB9.YZbb01qF36O-GbKNOqxsuZe1fOg3kUtcimRUGHp42VI';

describe('isTokenExpired', () => {
  it('is false when token is valid', () => {
    // @ts-ignore
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1567630800000); // 2019-09-04 14:00 PDT
    expect(isTokenExpired(jwtToken)).toBe(false);
  });

  it('is true when token cannot be decoded', () => {
    expect(isTokenExpired('invalid token')).toBe(true);
  });

  it('is true when token is expired', () => {
    // @ts-ignore
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1567717200000); // 2019-09-05 14:00 PDT
    expect(isTokenExpired(jwtToken)).toBe(true);

    // @ts-ignore
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1567803600000); // 2019-09-06 14:00 PDT
    expect(isTokenExpired(jwtToken)).toBe(true);
  });
});
