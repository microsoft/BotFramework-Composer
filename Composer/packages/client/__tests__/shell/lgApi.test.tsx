// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook, HookResult } from '@botframework-composer/test-utils/lib/hooks';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { useLgApi } from '../../src/shell/lgApi';
import { lgFilesSelectorFamily, localeState, dispatcherState, currentProjectIdState } from '../../src/recoilModel';
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
  let removeLgTemplatesMock, initRecoilState, copyLgTemplateMock, updateLgTemplateMock;
  let result: HookResult<any>;

  beforeEach(() => {
    updateLgTemplateMock = jest.fn();
    copyLgTemplateMock = jest.fn();
    removeLgTemplatesMock = jest.fn();

    initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(localeState(state.projectId), 'en-us');
      set(lgFilesSelectorFamily(state.projectId), state.lgFiles);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        updateLgTemplate: updateLgTemplateMock,
        copyLgTemplate: copyLgTemplateMock,
        removeLgTemplates: removeLgTemplatesMock,
      }));
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };
    const rendered = renderHook(() => useLgApi(state.projectId), {
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
      projectId: state.projectId,
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
      projectId: state.projectId,
    };
    expect(copyLgTemplateMock).toBeCalledWith(arg);
  });

  it('should call remove lg template action', () => {
    result.current.removeLgTemplate('test.en-us', 'bar');

    expect(removeLgTemplatesMock).toBeCalledTimes(1);

    const arg = {
      id: 'test.en-us',
      templateNames: ['bar'],
      projectId: state.projectId,
    };
    expect(removeLgTemplatesMock).toBeCalledWith(arg);
  });

  it('should call remove lg templates action', () => {
    result.current.removeLgTemplates('test.en-us', ['bar']);

    expect(removeLgTemplatesMock).toBeCalledTimes(1);
    const arg = {
      id: 'test.en-us',
      templateNames: ['bar'],
      projectId: state.projectId,
    };
    expect(removeLgTemplatesMock).toBeCalledWith(arg);
  });
});
