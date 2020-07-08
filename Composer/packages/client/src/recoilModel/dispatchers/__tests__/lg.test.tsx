// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { LgFile, LgTemplate } from '@bfc/shared/src/types/indexers';
import { useRecoilValue } from 'recoil';

import { lgDispatcher } from '../lg';
import { renderRecoilHook, act } from '../../../../__tests__/testUtils';
import { lgFilesState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

jest.mock('../../parsers/lgWorker', () => {
  return {
    addTemplate: (content, template) => new Promise((resolve) => resolve(content)),
    updateIntent: (a, b, c) => c.Body,
    removeIntent: (a, b) => b,
  };
});
const getLgFile = (id, content): LgFile => ({ id, content } as LgFile);

const getLgTemplate = (name, body): LgTemplate =>
  ({
    name,
    body,
  } as LgTemplate);

describe('Lg dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const [lgFile, setLgFile] = useRecoilState(lgFilesState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        lgFile,
        setLgFile,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: lgFilesState, initialValue: [{ action1: 'initialVisualEditorValue' }] }],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          lgDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should set clipboard state correctly', async () => {
    const lgFile: LgFile = getLgFile('1', '# Hello-${Welcome(time)} ${name}');
    const lgTemplate: LgTemplate = getLgTemplate('new-lg', '-TemplateValue');

    act(async () => {
      await dispatcher.createLgTemplate({ file: lgFile, projectId: 'project_1', template: lgTemplate });
    });

    expect(renderedComponent.current.lgFile).toHaveLength(1);
  });
});
