// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { LgFile, LgTemplate } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { lgDispatcher } from '../lg';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '..';
import { lgFilesSelectorFamily } from '../../selectors';

const projectId = '123asad.123sad';

jest.mock('../../parsers/lgWorker', () => {
  const filterParseResult = (lgFile: LgFile) => {
    const cloned = { ...lgFile };
    delete cloned.parseResult;
    return cloned;
  };
  return {
    parse: (projectId, id, content) => ({ id, content }),
    addTemplate: (projectId, lgFile, template) =>
      filterParseResult(require('@bfc/indexers/lib/utils/lgUtil').addTemplate(lgFile, template)),
    addTemplates: (projectId, lgFile, templates) =>
      filterParseResult(require('@bfc/indexers/lib/utils/lgUtil').addTemplates(lgFile, templates)),
    updateTemplate: (projectId, lgFile, templateName, template) =>
      filterParseResult(require('@bfc/indexers/lib/utils/lgUtil').updateTemplate(lgFile, templateName, template)),
    removeTemplate: (projectId, lgFile, templateName) =>
      filterParseResult(require('@bfc/indexers/lib/utils/lgUtil').removeTemplate(lgFile, templateName)),
    removeTemplates: (projectId, lgFile, templateNames) =>
      filterParseResult(require('@bfc/indexers/lib/utils/lgUtil').removeTemplates(lgFile, templateNames)),
    copyTemplate: (projectId, lgFile, fromTemplateName, toTemplateName) =>
      filterParseResult(
        require('@bfc/indexers/lib/utils/lgUtil').copyTemplate(lgFile, fromTemplateName, toTemplateName)
      ),
  };
});
const lgFiles = [
  {
    id: 'a.en-us',
    content: `\r\n# Hello\r\n-hi`,
    templates: [{ name: 'Hello', body: '-hi', parameters: [] }],
    diagnostics: [],
    imports: [],
    allTemplates: [{ name: 'Hello', body: '-hi', parameters: [] }],
    isContentUnparsed: false,
  },
] as LgFile[];

// const getLgFile = (id, content): LgFile => ({ id, content } as LgFile);

const getLgTemplate = (name, body): LgTemplate =>
  ({
    name,
    body,
  } as LgTemplate);

describe('Lg dispatcher', () => {
  const useRecoilTestHook = () => {
    const [lgFiles, setLgFiles] = useRecoilState(lgFilesSelectorFamily(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      lgFiles,
      setLgFiles,
      currentDispatcher,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: lgFilesSelectorFamily(projectId), initialValue: lgFiles },
        { recoilState: currentProjectIdState, initialValue: projectId },
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
        id: 'a.en-us',
        template: getLgTemplate('Test', '-add'),
        projectId,
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`\r\n# Hello\r\n-hi\r\n# Test()\r\n-add`);
  });

  it('should update a lg file', async () => {
    await act(async () => {
      await dispatcher.updateLgFile({ id: 'a.en-us', content: `test`, projectId });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`test`);
  });

  it('should update a lg template', async () => {
    await act(async () => {
      await dispatcher.updateLgTemplate({
        id: 'a.en-us',
        templateName: 'Hello',
        template: getLgTemplate('Hello', '-TemplateValue'),
        projectId,
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(`\r\n# Hello()\r\n-TemplateValue`);
  });

  it('should remove a lg template', async () => {
    await act(async () => {
      await dispatcher.removeLgTemplate({
        id: 'a.en-us',
        templateName: 'Hello',
        projectId,
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(``);
  });

  it('should remove lg templates', async () => {
    await act(async () => {
      await dispatcher.removeLgTemplates({
        id: 'a.en-us',
        templateNames: ['Hello'],
        projectId,
      });
    });

    expect(renderedComponent.current.lgFiles[0].content).toBe(``);
  });
});
