// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parse, addSection, removeSection, updateSection, insertSection, updateQnASection } from '../src/utils/qnaUtil';

const content1 = `> # QnA Definitions
### ? who is the ceo?
- get me your ceo info?
	\`\`\`
	Sorry, I don't know.
	\`\`\`


### ? How do I programmatically update my KB?
	\`\`\`
	You can use our REST apis to manage your KB.
	\`\`\`
`;
const content2 = `> # QnA pairs

> !# @qna.pair.source = onlineFile.pdf

<a id = "1"></a>

## ? With Windows 10

\`\`\`markdown
**With Windows 10**
\`\`\``;

describe('QnA file parse', () => {
  const fileId1 = 'a.qna';

  it('parse qna file', () => {
    const qnaFile = parse(fileId1, content1);
    const { qnaSections, content, id, diagnostics } = qnaFile;

    expect(id).toEqual(fileId1);
    expect(content).toEqual(content1);
    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'who is the ceo?',
    });
    expect(qnaSections[0].Answer).toContain("Sorry, I don't know.");
    expect(qnaSections[1].Questions[0]).toMatchObject({
      content: 'How do I programmatically update my KB?',
    });
    expect(qnaSections[1].Answer).toContain('You can use our REST apis to manage your KB.');
  });
});

describe('QnA Section CRUD', () => {
  const fileId1 = 'a.qna';

  it('add section', () => {
    const newAddedSection = `
# ? When did Satya Nadella become CEO of Microsoft?
\`\`\`
February 4, 2014.
\`\`\`
`;
    const qnaFile = parse(fileId1, content1);
    const { qnaSections, content, diagnostics } = addSection(qnaFile, newAddedSection);

    expect(content).toEqual(content1 + '\n' + newAddedSection);
    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(3);
    expect(qnaSections[2].Questions.length).toEqual(1);
    expect(qnaSections[2].Questions[0]).toMatchObject({
      content: 'When did Satya Nadella become CEO of Microsoft?',
    });
    expect(qnaSections[2].Answer).toEqual('February 4, 2014.');
  });

  it('insert section', () => {
    const newAddedSection = `
# ? When did Satya Nadella become CEO of Microsoft?
\`\`\`
February 4, 2014.
\`\`\`
`;
    const qnaFile = parse(fileId1, content1);
    const { qnaSections, diagnostics } = insertSection(qnaFile, 1, newAddedSection);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(3);
    expect(qnaSections[2].Questions.length).toEqual(1);
    expect(qnaSections[1].Questions[0]).toMatchObject({
      content: 'When did Satya Nadella become CEO of Microsoft?',
    });
    expect(qnaSections[1].Answer).toEqual('February 4, 2014.');
    expect(qnaSections[2].Questions[0]).toMatchObject({
      content: 'How do I programmatically update my KB?',
    });
    expect(qnaSections[2].Answer).toContain('You can use our REST apis to manage your KB.');
  });

  it('remove section', () => {
    const qnaFile = parse(fileId1, content1);
    const { qnaSections, diagnostics } = removeSection(qnaFile, qnaFile.qnaSections[0].sectionId);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(1);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'How do I programmatically update my KB?',
    });
  });

  it('update section', () => {
    const qnaFile = parse(fileId1, content1);
    const targetSection = qnaFile.qnaSections[0];
    const updatedSectionContent = `### ? Who is the CEO of Microsoft?
\`\`\`
Satya Nadella.
\`\`\`
`;
    const { qnaSections, diagnostics } = updateSection(qnaFile, targetSection.sectionId, updatedSectionContent);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'Who is the CEO of Microsoft?',
    });
    expect(qnaSections[0].Answer).toContain('Satya Nadella.');
    expect(qnaSections[1].Questions[0]).toMatchObject({
      content: 'How do I programmatically update my KB?',
    });
    expect(qnaSections[1].Answer).toContain('You can use our REST apis to manage your KB.');
  });
});

describe('QnA Questions/Answer CRUD', () => {
  const fileId1 = 'a.qna';

  it('update Answer in qna pair', () => {
    const qnaFile = parse(fileId1, content1);
    const targetSection = qnaFile.qnaSections[0];
    const changes = {
      Answer: 'Satya Nadella.',
    };
    const { qnaSections, diagnostics } = updateQnASection(qnaFile, targetSection.sectionId, changes);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions.length).toEqual(2);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'who is the ceo?',
    });
    expect(qnaSections[0].Questions[1]).toMatchObject({
      content: 'get me your ceo info?',
    });
    expect(qnaSections[0].Answer).toEqual('Satya Nadella.');
  });

  it('update question in qna pair', () => {
    const qnaFile = parse(fileId1, content1);
    const targetSection = qnaFile.qnaSections[0];
    const targetQuestionId = targetSection.Questions[0].id;
    const changes = {
      Questions: [
        {
          id: targetQuestionId,
          content: 'Who is the CEO of Microsoft?',
        },
      ],
    };
    const { qnaSections, diagnostics } = updateQnASection(qnaFile, targetSection.sectionId, changes);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions.length).toEqual(2);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      // id: targetQuestionId, // when do re-parse, id has changed.
      content: 'Who is the CEO of Microsoft?',
    });
    expect(qnaSections[0].Answer).toContain("Sorry, I don't know.");
  });

  it('add question in qna pair', () => {
    const qnaFile = parse(fileId1, content1);
    const targetSection = qnaFile.qnaSections[0];
    const changes = {
      Questions: [
        {
          content: 'Who is the CFO?',
        },
      ],
    };
    const { qnaSections, diagnostics } = updateQnASection(qnaFile, targetSection.sectionId, changes);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions.length).toEqual(3);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'who is the ceo?',
    });
    expect(qnaSections[0].Questions[1]).toMatchObject({
      content: 'get me your ceo info?',
    });
    expect(qnaSections[0].Questions[2]).toMatchObject({
      content: 'Who is the CFO?',
    });
    expect(qnaSections[0].Answer).toContain("Sorry, I don't know.");
  });

  it('remove question in qna pair', () => {
    const qnaFile = parse(fileId1, content1);
    const targetSection = qnaFile.qnaSections[0];
    const targetQuestionId = targetSection.Questions[0].id;
    const changes = {
      Questions: [
        {
          id: targetQuestionId,
        },
      ],
    };
    const { qnaSections, diagnostics } = updateQnASection(qnaFile, targetSection.sectionId, changes);

    expect(diagnostics.length).toEqual(0);
    expect(qnaSections.length).toEqual(2);
    expect(qnaSections[0].Questions.length).toEqual(1);
    expect(qnaSections[0].Questions[0]).toMatchObject({
      content: 'get me your ceo info?',
    });
    expect(qnaSections[0].Answer).toContain("Sorry, I don't know.");
  });
});
