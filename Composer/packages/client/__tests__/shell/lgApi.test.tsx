// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useLgApi } from '../../src/shell/lgApi';
import { useStoreContext } from '../../src/hooks/useStoreContext';

jest.mock('../../src/hooks/useStoreContext', () => ({
  useStoreContext: jest.fn(),
}));

const state = {
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [
        {
          body: '- ${add(1,2)}',
          name: 'bar',
        },
      ],
    },
  ],
  focusPath: '',
  locale: 'en-us',
  projectId: 'test',
};

const resolvers = { lgFileResolver: jest.fn((id) => state.lgFiles.find((file) => file.id === id)) };

const actions = {
  updateLgTemplate: jest.fn(),
  copyLgTemplate: jest.fn(),
  removeLgTemplate: jest.fn(),
  removeLgTemplates: jest.fn(),
};

(useStoreContext as jest.Mock).mockReturnValue({
  state,
  resolvers,
  actions,
});

describe('use lgApi hooks', () => {
  it('should get lg template by id', () => {
    const { result } = renderHook(() => useLgApi());

    const templates = result.current.getLgTemplates('test.en-us');
    expect(templates[0].name).toBe('bar');

    function testWrongId() {
      result.current.getLgTemplates('wrong.en-us');
    }
    expect(testWrongId).toThrow();
  });

  it('should call update lg template action', () => {
    const { result } = renderHook(() => useLgApi());

    result.current.updateLgTemplate('test.en-us', 'bar', 'update');
    result.current.updateLgTemplate.flush();
    expect(actions.updateLgTemplate).toBeCalledTimes(1);
    const arg = {
      file: {
        content: 'test',
        id: 'test.en-us',
        templates: [{ body: '- ${add(1,2)}', name: 'bar' }],
      },
      projectId: 'test',
      template: {
        body: 'update',
        name: 'bar',
        parameters: [],
      },
      templateName: 'bar',
    };
    expect(actions.updateLgTemplate).toBeCalledWith(arg);
  });

  it('should call copy lg template action', () => {
    const { result } = renderHook(() => useLgApi());

    result.current.copyLgTemplate('test.en-us', 'from', 'to');

    expect(actions.copyLgTemplate).toBeCalledTimes(1);
    const arg = {
      file: {
        content: 'test',
        id: 'test.en-us',
        templates: [{ body: '- ${add(1,2)}', name: 'bar' }],
      },
      fromTemplateName: 'from',
      projectId: 'test',
      toTemplateName: 'to',
    };
    expect(actions.copyLgTemplate).toBeCalledWith(arg);
  });

  it('should call remove lg template action', () => {
    const { result } = renderHook(() => useLgApi());

    result.current.removeLgTemplate('test.en-us', 'bar');

    expect(actions.removeLgTemplate).toBeCalledTimes(1);

    const arg = {
      file: {
        content: 'test',
        id: 'test.en-us',
        templates: [{ body: '- ${add(1,2)}', name: 'bar' }],
      },
      projectId: 'test',
      templateName: 'bar',
    };
    expect(actions.removeLgTemplate).toBeCalledWith(arg);
  });

  it('should call remove lg templates action', () => {
    const { result } = renderHook(() => useLgApi());

    result.current.removeLgTemplates('test.en-us', ['bar']);

    expect(actions.removeLgTemplates).toBeCalledTimes(1);
    const arg = {
      file: {
        content: 'test',
        id: 'test.en-us',
        templates: [{ body: '- ${add(1,2)}', name: 'bar' }],
      },
      projectId: 'test',
      templateNames: ['bar'],
    };
    expect(actions.removeLgTemplates).toBeCalledWith(arg);
  });
});
