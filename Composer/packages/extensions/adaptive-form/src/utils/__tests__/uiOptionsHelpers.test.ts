// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, UIOptions } from '@bfc/extension';

import { getUiLabel, getUiDescription, getUiPlaceholder } from '../uiOptionsHelpers';

let props;

beforeEach(() => {
  props = {
    label: 'prop label',
    description: 'prop description',
    placeholder: 'prop placeholder',
    value: 'some value',
    name: 'prop name',
    schema: {
      title: 'schema title',
      description: 'schema description',
    },
    uiOptions: {},
  } as FieldProps;
});

describe('getUiLabel', () => {
  it('returns false if the label prop is false', () => {
    expect(getUiLabel({ ...props, label: false })).toBe(false);
  });

  it('invokes ui options label if a function', () => {
    const uiOptions = { label: jest.fn() };
    uiOptions.label.mockReturnValue('ui option label');
    expect(getUiLabel({ ...props, uiOptions })).toEqual('ui option label');

    expect(uiOptions.label).toHaveBeenCalledWith(props.value);
  });

  it('returns ui options label if it is not a function', () => {
    let uiOptions: UIOptions = { label: 'ui option label' };
    expect(getUiLabel({ ...props, uiOptions })).toEqual('ui option label');

    uiOptions = { label: false };
    expect(getUiLabel({ ...props, uiOptions })).toBe(false);
  });

  it('falls back to prop label, schema title, or name', () => {
    expect(getUiLabel(props)).toEqual('prop label');
    expect(getUiLabel({ ...props, label: undefined })).toEqual('schema title');
    expect(getUiLabel({ ...props, label: undefined, schema: { title: undefined } })).toEqual('prop name');
  });
});

describe('getUiDescription', () => {
  it('invokes ui options description if a function', () => {
    const uiOptions = { description: jest.fn() };
    uiOptions.description.mockReturnValue('ui option description');
    expect(getUiDescription({ ...props, uiOptions })).toEqual('ui option description');

    expect(uiOptions.description).toHaveBeenCalledWith(props.value);
  });

  it('returns ui options description if it is not a function', () => {
    const uiOptions = { description: 'ui option description' };
    expect(getUiDescription({ ...props, uiOptions })).toEqual('ui option description');
  });

  it('falls back to prop description or schema description', () => {
    expect(getUiDescription(props)).toEqual('prop description');
    expect(getUiDescription({ ...props, description: undefined })).toEqual('schema description');
  });
});

describe('getUiPlaceholder', () => {
  it('invokes ui options placeholder if a function', () => {
    const uiOptions = { placeholder: jest.fn() };
    uiOptions.placeholder.mockReturnValue('ui option placeholder');
    expect(getUiPlaceholder({ ...props, uiOptions })).toEqual('ui option placeholder');

    expect(uiOptions.placeholder).toHaveBeenCalledWith(props.value);
  });

  it('returns ui options placeholder if it is not a function', () => {
    const uiOptions = { placeholder: 'ui option placeholder' };
    expect(getUiPlaceholder({ ...props, uiOptions })).toEqual('ui option placeholder');
  });

  it('falls back to prop placeholder or schema examples', () => {
    expect(getUiPlaceholder(props)).toEqual('prop placeholder');
    expect(getUiPlaceholder({ ...props, placeholder: undefined, schema: { examples: ['one', 'two'] } })).toEqual(
      'ex. one, two'
    );
  });
});
