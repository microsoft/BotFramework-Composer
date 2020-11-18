// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useCallback, useEffect } from 'react';
import mapValues from 'lodash/mapValues';
import some from 'lodash/some';
import formatMessage from 'format-message';

type ValidationResult = string | undefined | Promise<string | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldValidator<T = any> = (data: T) => ValidationResult;

export interface FormOptions {
  validateOnMount?: boolean;
}

interface FormField<T = any> {
  defaultValue?: T;
  required?: boolean;
  validate?: FieldValidator<T>;
}

type FormErrors<D extends object> = {
  [key in keyof D]: string | undefined;
};

export type FieldConfig<D extends object> = { [key in keyof D]: FormField<D[keyof D]> };

const hasErrors = <D extends object>(errors: FormErrors<D>): boolean => {
  return some(errors);
};

export function useForm<D extends object>(fields: FieldConfig<D>, opts: FormOptions = {}) {
  const [formData, setFormData] = useState(mapValues(fields, (f) => f.defaultValue ?? '') as D);
  const [formErrors, setFormErrors] = useState<FormErrors<D>>(mapValues(formData, () => undefined));

  const validateField = async (name: keyof D, fieldConfig: FormField, value: unknown): Promise<void> => {
    let error: string | undefined = undefined;

    if (fieldConfig.required && !value) {
      error = formatMessage('{name} is required', { name });
    } else if (!fieldConfig.required && !value) {
      return;
    } else if (typeof fieldConfig.validate === 'function') {
      error = await fieldConfig.validate(value);
    }

    setFormErrors((current) => ({
      ...current,
      [name]: error ?? undefined,
    }));
  };

  const updateField = useCallback((field: keyof D, newValue?: D[keyof D]) => {
    setFormData((current) => ({
      ...current,
      [field]: newValue ?? undefined,
    }));
    validateField(field, fields[field], newValue);
  }, []);

  const updateForm = useCallback((newData: D) => {
    setFormData(newData);
    Object.entries(newData).forEach(([key, value]) => {
      validateField(key as keyof D, fields[key], value);
    });
  }, []);

  const validateForm = useCallback(() => {
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key as keyof D, fields[key], value);
    });
  }, [fields, formData]);

  useEffect(() => {
    if (opts.validateOnMount) {
      Object.entries(formData).forEach(([key, value]) => {
        validateField(key as keyof D, fields[key], value);
      });
    }
  }, []);

  return { formData, formErrors, updateField, updateForm, validateForm, hasErrors: hasErrors(formErrors) };
}
