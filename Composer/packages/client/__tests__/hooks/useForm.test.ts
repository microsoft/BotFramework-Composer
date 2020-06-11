// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook, act } from '@bfc/test-utils/lib/hooks';

import { useForm, FieldConfig } from '../../src/hooks/useForm';

interface TestFormData {
  requiredField: string;
  customValidationField: string;
  asyncValidationField: string;
}

describe('useForm', () => {
  const custValidate = jest.fn();
  const asyncValidate = jest.fn();

  const fields: FieldConfig<TestFormData> = {
    requiredField: {
      defaultValue: 'foo',
      required: true,
    },
    customValidationField: {
      defaultValue: 'bar',
      validate: custValidate,
    },
    asyncValidationField: {
      defaultValue: 'baz',
      validate: asyncValidate,
    },
  };

  describe('formData', () => {
    it('applies default values', () => {
      const { result } = renderHook(() => useForm(fields));

      expect(result.current.formData).toEqual({
        requiredField: 'foo',
        customValidationField: 'bar',
        asyncValidationField: 'baz',
      });
    });

    it('can update single fields', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      await act(async () => {
        result.current.updateField('requiredField', 'new value');
        await waitForNextUpdate();
      });

      expect(result.current.formData.requiredField).toEqual('new value');
    });

    it('can update the whole object', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      await act(async () => {
        result.current.updateForm({
          requiredField: 'new',
          customValidationField: 'form',
          asyncValidationField: 'data',
        });
        await waitForNextUpdate();
      });

      expect(result.current.formData).toEqual({
        requiredField: 'new',
        customValidationField: 'form',
        asyncValidationField: 'data',
      });
    });
  });

  describe('formErrors', () => {
    it('can validate when mounting', async () => {
      custValidate.mockReturnValue('custom');
      asyncValidate.mockResolvedValue('async');
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields, { validateOnMount: true }));
      await waitForNextUpdate();

      expect(result.current.formErrors).toMatchObject({
        customValidationField: 'custom',
        asyncValidationField: 'async',
      });
    });

    it('validates required fields', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      await act(async () => {
        result.current.updateField('requiredField', '');
        await waitForNextUpdate();
      });

      expect(result.current.formErrors.requiredField).toEqual('requiredField is required');
    });

    it('validates using a custom validator', async () => {
      custValidate.mockReturnValue('my custom validation');
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      await act(async () => {
        result.current.updateField('customValidationField', 'foo');
        await waitForNextUpdate();
      });

      expect(result.current.formErrors.customValidationField).toEqual('my custom validation');
    });

    it('validates using an asyn validator', async () => {
      asyncValidate.mockResolvedValue('my async validation');
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      await act(async () => {
        result.current.updateField('asyncValidationField', 'foo');
        await waitForNextUpdate();
      });

      expect(result.current.formErrors.asyncValidationField).toEqual('my async validation');
    });
  });

  describe('hasErrors', () => {
    it('returns true when there are errors', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useForm(fields));

      expect(result.current.hasErrors).toBe(false);

      await act(async () => {
        result.current.updateField('requiredField', '');
        await waitForNextUpdate();
      });

      expect(result.current.hasErrors).toBe(true);
    });
  });
});
