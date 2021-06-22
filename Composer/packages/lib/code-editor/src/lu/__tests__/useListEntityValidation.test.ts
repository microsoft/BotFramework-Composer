// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { ListEntity } from '../types';
import { useListEntityValidation } from '../dialogs/useListEntityValidation';

const validListEntity: ListEntity = {
  entityType: 'list',
  name: 'list0',
  items: [{ id: 0, normalizedValue: 'value', synonyms: [] }],
};

const invalidListEntity: ListEntity = {
  entityType: 'list',
  name: 'name=+',
  items: [{ id: 0, normalizedValue: '', synonyms: [] }],
};

const invalidNameListEntity: ListEntity = {
  entityType: 'list',
  name: 'name=',
  items: [{ id: 0, normalizedValue: 'nv', synonyms: [] }],
};

const invalidNormalizedValueMissingListEntity: ListEntity = {
  entityType: 'list',
  name: '',
  items: [
    { id: 0, normalizedValue: 'nv1', synonyms: [] },
    { id: 1, normalizedValue: '', synonyms: [] },
    { id: 2, normalizedValue: 'nv3', synonyms: ['nv3'] },
    { id: 3, normalizedValue: '', synonyms: [] },
  ],
};

const invalidNormalizedValueDuplicateListEntity: ListEntity = {
  entityType: 'list',
  name: '',
  items: [
    { id: 0, normalizedValue: 'nv1', synonyms: [] },
    { id: 1, normalizedValue: 'nv1', synonyms: [] },
    { id: 2, normalizedValue: 'nv3', synonyms: ['nv3'] },
    { id: 3, normalizedValue: 'nv4', synonyms: [] },
  ],
};

describe('useListEntityValidation hook', () => {
  it('Should validate list entity name', () => {
    const { result } = renderHook(() => useListEntityValidation(invalidNameListEntity));
    expect(result.current.nameError).toBe(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _.'
    );
    expect(result.current.hasErrors).toBeTruthy();
  });

  it('Should validate list items normalized name uniqueness', () => {
    const { result } = renderHook(() => useListEntityValidation(invalidNormalizedValueDuplicateListEntity));
    expect(result.current.itemErrors).toStrictEqual({ '1': 'Already used' });
    expect(result.current.hasErrors).toBeTruthy();
  });

  it('Should validate list items normalized name existence', () => {
    const { result } = renderHook(() => useListEntityValidation(invalidNormalizedValueMissingListEntity));
    expect(result.current.itemErrors).toStrictEqual({ '1': 'Required', '3': 'Required' });
    expect(result.current.hasErrors).toBeTruthy();
  });

  it('Should detect errors on an invalid list entity', () => {
    const { result } = renderHook(() => useListEntityValidation(invalidListEntity));
    expect(result.current.hasErrors).toBeTruthy();
  });

  it('Should detect no errors on a valid list entity', () => {
    const { result } = renderHook(() => useListEntityValidation(validListEntity));
    expect(result.current.hasErrors).toBeFalsy();
  });
});
