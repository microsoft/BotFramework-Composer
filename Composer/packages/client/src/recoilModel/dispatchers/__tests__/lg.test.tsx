// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { LgFile, LgTemplate } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { lgDispatcher } from '../lg';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { lgFilesState, projectIdState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

jest.mock('../../parsers/lgWorker', () => {
  const filterParseResult = (lgFile: LgFile) => {
    const cloned = { ...lgFile };
    delete cloned.parseResult;
    return cloned;
  };
  return {
    parse: (projectId, id, content) => ({ id, content }),
    addTemplate: (projectId, lgFile, template) =>
      filterParseResult(require('../../../utils/lgUtil').addTemplate(lgFile, template)),
    addTemplates: (projectId, lgFile, templates) =>
      filterParseResult(require('../../../utils/lgUtil').addTemplates(lgFile, templates)),
    updateTemplate: (projectId, lgFile, templateName, template) =>
      filterParseResult(require('../../../utils/lgUtil').updateTemplate(lgFile, templateName, template)),
    removeTemplate: (projectId, lgFile, templateName) =>
      filterParseResult(require('../../../utils/lgUtil').removeTemplate(lgFile, templateName)),
    removeTemplates: (projectId, lgFile, templateNames) =>
      filterParseResult(require('../../../utils/lgUtil').removeTemplates(lgFile, templateNames)),
    copyTemplate: (projectId, lgFile, fromTemplateName, toTemplateName) =>
      filterParseResult(require('../../../utils/lgUtil').copyTemplate(lgFile, fromTemplateName, toTemplateName)),
  };
});
const lgFiles = [
  {
    id: 'common.en-us',
    content: `\r\n# Hello\r\n-hi`,
  },
] as LgFile[];

// const getLgFile = (id, content): LgFile => ({ id, content } as LgFile);

const getLgTemplate = (name, body): LgTemplate =>
  ({
    name,
    body,
  } as LgTemplate);

describe('Lg dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const [lgFiles, setLgFiles] = useRecoilState(lgFilesState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        lgFiles,
        setLgFiles,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: lgFilesState, initialValue: lgFiles },
        { recoilState: projectIdState, initialValue: 'test' },
      ],
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

  it('should create a lg template', async () => {
    await act(async () => {
      await dispatcher.createLgTemplate({
        id: 'common.en-us',
        template: getLgTemplate('Test', '-add'),
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`\r\n# Hello\r\n-hi\r\n# Test()\r\n-add`);
  });

  it('should update a lg file', async () => {
    await act(async () => {
      await dispatcher.updateLgFile({ id: 'common.en-us', content: `test` });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`test`);
  });

  it('should update a lg template', async () => {
    await act(async () => {
      await dispatcher.updateLgTemplate({
        id: 'common.en-us',
        templateName: 'Hello',
        template: getLgTemplate('Hello', '-TemplateValue'),
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`\r\n# Hello()\r\n-TemplateValue`);
  });

  it('should remove a lg template', async () => {
    await act(async () => {
      await dispatcher.removeLgTemplate({
        id: 'common.en-us',
        templateName: 'Hello',
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(``);
  });

  it('should remove lg templates', async () => {
    await act(async () => {
      await dispatcher.removeLgTemplates({
        id: 'common.en-us',
        templateNames: ['Hello'],
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(``);
  });
});
