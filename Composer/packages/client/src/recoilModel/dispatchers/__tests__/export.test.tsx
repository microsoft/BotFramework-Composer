// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import httpClient from '../../../utils/httpUtil';
import { exportDispatcher } from '../export';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { botNameState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

jest.mock('../../../utils/httpUtil');

describe('Export dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher, prevDocumentCreateElement, prevCreateObjectURL, prevAppendChild;
  beforeEach(() => {
    prevDocumentCreateElement = document.createElement;
    prevCreateObjectURL = window.URL.createObjectURL;
    prevAppendChild = document.body.appendChild;

    const useRecoilTestHook = () => {
      const botName = useRecoilValue(botNameState);
      const currentDispatcher = useRecoilValue(dispatcherState);
      return {
        botName,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: botNameState, initialValue: 'emptybot-1' }],
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

    const createElement = (element) => {
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
      dispatcher.exportToZip({ projectId: '1234-232' });
    });
  });
});
