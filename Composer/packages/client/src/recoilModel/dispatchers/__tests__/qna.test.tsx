// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState } from 'recoil';
import { QnAFile } from '@bfc/shared';
import { qnaUtil } from '@bfc/indexers';
import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { qnaDispatcher } from '../qna';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { qnaFilesState, currentProjectIdState, localeState, dispatcherState } from '../../atoms';
import { Dispatcher } from '..';

jest.mock('../../parsers/qnaWorker', () => {
  const filterParseResult = (qnaFile: QnAFile) => {
    const cloned = { ...qnaFile, resource: '' };
    return cloned;
  };
  return {
    parse: (id: string, content) => ({ id, content }),
    removeSection: (projectId: string, qnaFile, sectionId: string) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').removeSection(qnaFile, sectionId)),
    insertSection: (projectId: string, qnaFile, position, sectionContent) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').insertSection(qnaFile, position, sectionContent)),
    createQnAQuestion: (projectId: string, qnaFile, sectionId: string, questionContent) =>
      filterParseResult(
        require('@bfc/indexers/lib/utils/qnaUtil').createQnAQuestion(qnaFile, sectionId, questionContent)
      ),
    updateQnAQuestion: (projectId: string, qnaFile, sectionId: string, questionId: string, questionContent) =>
      filterParseResult(
        require('@bfc/indexers/lib/utils/qnaUtil').updateQnAQuestion(qnaFile, sectionId, questionId, questionContent)
      ),
    removeQnAQuestion: (projectId: string, qnaFile, sectionId: string, questionId: string) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').removeQnAQuestion(qnaFile, sectionId, questionId)),
    updateQnAAnswer: (projectId: string, qnaFile, sectionId: string, answerContent) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').updateQnAAnswer(qnaFile, sectionId, answerContent)),
    addImport: (projectId: string, qnaFile: string, path: string) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').addImport(qnaFile, path)),
    removeImport: (projectId: string, qnaFile, path: string) =>
      filterParseResult(require('@bfc/indexers/lib/utils/qnaUtil').removeImport(qnaFile, path)),
  };
});

const projectId = '123asad.123sad';
const locale = 'en-us';

const content = `# ? What's your name?
\`\`\`
Zoidberg
\`\`\``;

const qna1 = qnaUtil.parse('common.en-us', content);
const qnaFiles = [qna1];

describe('QnA dispatcher', () => {
  const useRecoilTestHook = () => {
    const [qnaFiles, setQnAFiles] = useRecoilState(qnaFilesState(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      qnaFiles,
      setQnAFiles,
      currentDispatcher,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: qnaFilesState(projectId), initialValue: qnaFiles },
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: localeState(projectId), initialValue: locale },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          qnaDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should create a qna pairs', async () => {
    const content = qnaUtil.generateQnAPair('Test', '-add');
    await act(async () => {
      await dispatcher.createQnAPairs({
        id: 'common.en-us',
        content,
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].content.replace(/\s/g, '')).toContain(content.replace(/\s/g, ''));
  });

  it('should update a qna file', async () => {
    const content = qnaUtil.generateQnAPair('Test', '-update');
    await act(async () => {
      await dispatcher.updateQnAFile({ id: 'common.en-us', content, projectId });
    });

    expect(renderedComponent.current.qnaFiles[0].content).toBe(content);
  });

  it('should update a qna question', async () => {
    await act(async () => {
      await dispatcher.updateQnAQuestion({
        id: 'common.en-us',
        sectionId: qna1.qnaSections[0].sectionId,
        questionId: qna1.qnaSections[0].Questions[0].id,
        content: 'What is your name, my friend?',
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].qnaSections[0].Questions[0].content).toContain(
      'What is your name, my friend?'
    );
  });

  it('should create/remove a qna question', async () => {
    await act(async () => {
      await dispatcher.createQnAQuestion({
        id: 'common.en-us',
        sectionId: qna1.qnaSections[0].sectionId,
        content: 'What is your name, my friend?',
        projectId,
      });
    });
    const section = renderedComponent.current.qnaFiles[0].qnaSections[0];

    expect(section.Questions[1].content).toContain('What is your name, my friend?');

    await act(async () => {
      await dispatcher.removeQnAQuestion({
        id: 'common.en-us',
        sectionId: section.sectionId,
        questionId: section.Questions[1].id,
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].content).not.toContain('What is your name, my friend?');
  });

  it('should update a qna answer', async () => {
    await act(async () => {
      await dispatcher.updateQnAAnswer({
        id: 'common.en-us',
        sectionId: qna1.qnaSections[0].sectionId,
        content: 'Bender',
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].qnaSections[0].Answer).toBe('Bender');
  });

  it('should remove a qna pair', async () => {
    await act(async () => {
      await dispatcher.removeQnAPairs({
        id: 'common.en-us',
        sectionId: qna1.qnaSections[0].sectionId,
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].content).toBe(``);
  });

  it('should create/remove import', async () => {
    await act(async () => {
      await dispatcher.createQnAImport({
        id: 'common.en-us',
        sourceId: 'guide.source',
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].content).toContain('[import](guide.source.qna)');

    await act(async () => {
      await dispatcher.removeQnAImport({
        id: 'common.en-us',
        sourceId: 'guide.source',
        projectId,
      });
    });

    expect(renderedComponent.current.qnaFiles[0].content).not.toContain('[import](guide.source.qna)');
  });

  it('should create/remove qna file', async () => {
    await act(async () => {
      await dispatcher.createQnAFile({
        id: 'guide',
        content: '> guide',
        projectId,
      });
    });

    const createdFile = renderedComponent.current.qnaFiles.find(({ id }) => id === 'guide.en-us');
    expect(createdFile).not.toBeFalsy();
    expect(createdFile!.content).toBe('> guide');

    await act(async () => {
      await dispatcher.removeQnAFile({
        id: 'guide',
        projectId,
      });
    });

    const createdFileAfterRemove = renderedComponent.current.qnaFiles.find(({ id }) => id === 'guide.en-us');
    expect(createdFileAfterRemove).toBeFalsy();
    expect(renderedComponent.current.qnaFiles.length).toBe(1);
  });

  it('should create qna kb from scratch and auto create import', async () => {
    await act(async () => {
      await dispatcher.createQnAKBFromScratch({
        id: 'common.en-us',
        name: 'guide',
        projectId,
      });
    });

    const createdFile = renderedComponent.current.qnaFiles.find(({ id }) => id === 'guide.source');
    expect(createdFile).not.toBeFalsy();

    const commonFile = renderedComponent.current.qnaFiles.find(({ id }) => id === 'common.en-us');
    expect(commonFile?.content).toContain('[import](guide.source.qna)');
  });

  it('should rename qna kb and re-create import', async () => {
    await act(async () => {
      await dispatcher.createQnAKBFromScratch({
        id: 'common.en-us',
        name: 'guide',
        projectId,
      });

      await dispatcher.renameQnAKB({
        id: 'guide.source',
        name: 'guide2.source',
        projectId,
      });

      await dispatcher.removeQnAImport({
        id: 'common.en-us',
        sourceId: 'guide.source',
        projectId,
      });

      await dispatcher.createQnAImport({
        id: 'common.en-us',
        sourceId: 'guide2.source',
        projectId,
      });
    });

    const createdFile1 = renderedComponent.current.qnaFiles.find(({ id }) => id === 'guide.source');
    expect(createdFile1).toBeFalsy();

    const createdFile2 = renderedComponent.current.qnaFiles.find(({ id }) => id === 'guide2.source');
    expect(createdFile2).not.toBeFalsy();

    const commonFile = renderedComponent.current.qnaFiles.find(({ id }) => id === 'common.en-us');
    expect(commonFile?.content).toContain('[import](guide2.source.qna)');
    expect(commonFile?.content).not.toContain('[import](guide.source.qna)');
  });
});
