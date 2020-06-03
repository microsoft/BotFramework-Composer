// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useLgApi } from '../../src/shell/lgApi';
import { StoreContextProvider } from '../testUtils';

describe('use lgApi hooks', () => {
  const updateLgTemplate = jest.fn((value) => value.template.body);
  const copyLgTemplate = jest.fn((value) => value.toTemplateName);
  const removeLgTemplate = jest.fn((value) => value.templateName);
  const removeLgTemplates = jest.fn((value) => value.templateNames);

  let state;
  let wrapper: React.FunctionComponent = () => null;
  beforeEach(() => {
    state = {
      lgFiles: [
        {
          content: 'test',
          id: 'test.en-us',
          templates: [
            {
              body: '- ${add(1,2)}',
              name: 'bar',
              parameters: [],
              range: { endLineNumber: 0, startLineNumber: 0 },
            },
          ],
        },
      ],
      focusPath: '',
      locale: 'en-us',
    };

    wrapper = ({ children }) => (
      <StoreContextProvider
        actions={{ updateLgTemplate, removeLgTemplate, copyLgTemplate, removeLgTemplates }}
        resolvers={{ lgFileResolver: jest.fn((id) => state.lgFiles.find((file) => file.id === id)) }}
        state={state}
      >
        {children}
      </StoreContextProvider>
    );
  });

  test('should get lg template by id', () => {
    const { result } = renderHook(() => useLgApi(), { wrapper });

    const templates = result.current.getLgTemplates('test.en-us');
    expect(templates[0].name).toBe('bar');

    function testWrongId() {
      result.current.getLgTemplates('wrong.en-us');
    }
    expect(testWrongId).toThrow();
  });

  test('should call update lg template action', () => {
    const { result } = renderHook(() => useLgApi(), { wrapper });

    result.current.updateLgTemplate('test.en-us', 'bar', 'update');

    expect(updateLgTemplate).toBeCalledTimes(1);
    expect(updateLgTemplate).toHaveReturnedWith('update');
  });

  test('should call copy lg template action', () => {
    const { result } = renderHook(() => useLgApi(), { wrapper });

    result.current.copyLgTemplate('test.en-us', 'from', 'to');

    expect(copyLgTemplate).toBeCalledTimes(1);
    expect(copyLgTemplate).toHaveReturnedWith('to');
  });

  test('should call remove lg template action', () => {
    const { result } = renderHook(() => useLgApi(), { wrapper });

    result.current.removeLgTemplate('test.en-us', 'bar');

    expect(removeLgTemplate).toBeCalledTimes(1);
    expect(removeLgTemplate).toHaveReturnedWith('bar');
  });

  test('should call remove lg templates action', () => {
    const { result } = renderHook(() => useLgApi(), { wrapper });

    result.current.removeLgTemplates('test.en-us', ['bar']);

    expect(removeLgTemplates).toBeCalledTimes(1);
    expect(removeLgTemplates).toHaveReturnedWith(['bar']);
  });
});
