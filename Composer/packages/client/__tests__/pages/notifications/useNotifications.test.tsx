// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { RecoilRoot } from 'recoil';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import useNotifications from '../../../src/pages/notifications/useNotifications';
import {
  projectIdState,
  dialogsState,
  luFilesState,
  lgFilesState,
  BotDiagnosticsState,
} from '../../../src/recoilModel';

const state = {
  projectId: 'test',
  dialogs: [
    {
      id: 'test',
      content: 'test',
      luFile: 'test',
      referredLuIntents: [],
      diagnostics: [
        {
          message: 'must be an expression',
          path: 'test.triggers[0]#Microsoft.OnUnknownIntent#condition',
          severity: 1,
          source: 'test',
        },
      ],
      skills: ['https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json'],
    },
  ],
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [
        {
          Body: '- test12345 ss',
          Entities: [],
          Name: 'test',
          range: {
            endLineNumber: 7,
            startLineNumber: 4,
          },
        },
      ],
      diagnostics: [
        {
          message: 'lu syntax error',
          severity: 0,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 7 },
            start: { character: 0, line: 7 },
          },
        },
      ],
    },
  ],
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [
        {
          body: '- ${add(1,2)}',
          name: 'bar',
          range: { endLineNumber: 0, startLineNumber: 0 },
        },
      ],
      diagnostics: [
        {
          message: 'lg syntax error',
          severity: 1,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 13 },
            start: { character: 0, line: 13 },
          },
        },
      ],
    },
  ],
  diagnostics: [
    {
      message: 'server error',
      severity: 0,
      source: 'server',
    },
  ],
  settings: {
    skill: [
      {
        manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
        name: 'Email Skill',
      },
    ],
  },
};

const initRecoilState = ({ set }) => {
  set(projectIdState, state.projectId);
  set(dialogsState, state.dialogs);
  set(luFilesState, state.luFiles);
  set(lgFilesState, state.lgFiles);
  set(BotDiagnosticsState, state.diagnostics);
};

describe('useNotification hooks', () => {
  let renderedResult;
  beforeEach(() => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useNotifications(), {
      wrapper,
    });
    renderedResult = result;
  });

  it('should return notifications', () => {
    expect(renderedResult.current.length).toBe(5);
  });

  it('should return filtered notifications', () => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useNotifications('Error'), {
      wrapper,
    });

    expect(result.current.length).toBe(2);
  });
});
