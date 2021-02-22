// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import httpClient from '../../../utils/httpUtil';
import { exportDispatcher } from '../export';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { botDisplayNameState, currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '../../../recoilModel/dispatchers';

jest.mock('../../../utils/httpUtil');
const projectId = '2345.32324';

describe('Export dispatcher', () => {
  const useRecoilTestHook = () => {
    const botName = useRecoilValue(botDisplayNameState(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);
    return {
      botName,
      currentDispatcher,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>,
    dispatcher: Dispatcher,
    prevDocumentCreateElement,
    prevCreateObjectURL,
    prevAppendChild;
  beforeEach(() => {
    prevDocumentCreateElement = document.createElement;
    prevCreateObjectURL = window.URL.createObjectURL;
    prevAppendChild = document.body.appendChild;

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: botDisplayNameState(projectId), initialValue: 'emptybot-1' },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          exportDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  afterEach(() => {
    document.createElement = prevDocumentCreateElement;
    window.URL.createObjectURL = prevCreateObjectURL;
    document.body.appendChild = prevAppendChild;
  });

  it('should set clipboard state correctly', () => {
    const elementClick = jest.fn();
    const setAttributeMock = jest.fn((action, fileName) => {
      expect(action).toBe('download');
      expect(fileName).toBe('emptybot-1_export.zip');
    });

    document.body.appendChild = jest.fn();
    window.URL.createObjectURL = jest.fn((params) => {
      expect(params).toBeDefined();
      expect(params instanceof Blob).toBeTruthy();
      return '';
    });

    const createElement = () => {
      return {
        click: elementClick,
        setAttribute: setAttributeMock,
      };
    };

    document.createElement = createElement as any;
    (httpClient.get as jest.Mock).mockResolvedValueOnce({
      data: 'zippedBinaryData',
    });

    act(() => {
      dispatcher.exportToZip(projectId);
    });
  });
});
