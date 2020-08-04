// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { useLgApi } from '../../src/shell/lgApi';
import { lgFilesState, localeState, projectIdState, dispatcherState } from '../../src/recoilModel';
import { Dispatcher } from '../../src/recoilModel/dispatchers';

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

// const resolvers = { lgFileResolver: jest.fn((id) => state.lgFiles.find((file) => file.id === id)) };

describe('use lgApi hooks', () => {
  let removeLgTemplatesMock, initRecoilState, copyLgTemplateMock, updateLgTemplateMock, removeLgTemplateMock, result;

  beforeEach(() => {
    updateLgTemplateMock = jest.fn();
    copyLgTemplateMock = jest.fn();
    removeLgTemplatesMock = jest.fn();
    removeLgTemplateMock = jest.fn();

    initRecoilState = ({ set }) => {
      set(projectIdState, state.projectId);
      set(localeState, 'en-us');
      set(lgFilesState, state.lgFiles);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        updateLgTemplate: updateLgTemplateMock,
        copyLgTemplate: copyLgTemplateMock,
        removeLgTemplates: removeLgTemplatesMock,
        removeLgTemplate: removeLgTemplateMock,
      }));
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };
    const rendered = renderHook(() => useLgApi(), {
      wrapper,
    });
    result = rendered.result;
  });

  it('should get lg template by id', () => {
    const templates = result.current.getLgTemplates('test.en-us');
    expect(templates[0].name).toBe('bar');

    function testWrongId() {
      result.current.getLgTemplates('wrong.en-us');
    }
    expect(testWrongId).toThrow();
  });

  it('should call update lg template action', () => {
    result.current.updateLgTemplate('test.en-us', 'bar', 'update');
    expect(updateLgTemplateMock).toBeCalledTimes(1);
    const arg = {
      id: 'test.en-us',
      template: {
        body: 'update',
        name: 'bar',
        parameters: [],
      },
      templateName: 'bar',
    };
    expect(updateLgTemplateMock).toBeCalledWith(arg);
  });

  it('should call copy lg template action', () => {
    result.current.copyLgTemplate('test.en-us', 'from', 'to');

    expect(copyLgTemplateMock).toBeCalledTimes(1);
    const arg = {
      id: 'test.en-us',
      fromTemplateName: 'from',
      toTemplateName: 'to',
    };
    expect(copyLgTemplateMock).toBeCalledWith(arg);
  });

  it('should call remove lg template action', () => {
    result.current.removeLgTemplate('test.en-us', 'bar');

    expect(removeLgTemplateMock).toBeCalledTimes(1);

    const arg = {
      id: 'test.en-us',
      templateName: 'bar',
    };
    expect(removeLgTemplateMock).toBeCalledWith(arg);
  });

  it('should call remove lg templates action', () => {
    result.current.removeLgTemplates('test.en-us', ['bar']);

    expect(removeLgTemplatesMock).toBeCalledTimes(1);
    const arg = {
      id: 'test.en-us',
      templateNames: ['bar'],
    };
    expect(removeLgTemplatesMock).toBeCalledWith(arg);
  });
});
