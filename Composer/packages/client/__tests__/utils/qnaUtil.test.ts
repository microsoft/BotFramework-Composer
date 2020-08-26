// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { qnaIndexer } from '@bfc/indexers/src/qnaIndexer';

import {
  addSection,
  updateSection,
  removeSection,
  insertSection,
  addQuestion,
  updateQuestion,
  updateAnswer,
} from '../../src/utils/qnaUtil';

describe('qna utils', () => {
  const qnaPair1 = `
# ?Question1
\`\`\`
Answer1
\`\`\``;
  const qnaPair2 = `
# ?Question2
\`\`\`
Answer2
\`\`\``;

  it('should add QnA Section', () => {
    const newContent = addSection(qnaPair1, qnaPair2);
    const res = qnaIndexer.parse(newContent);
    const qnaSections = res.qnaSections;
    expect(qnaSections.length).toBe(2);
  });

  it('should update QnA Section', () => {
    const newContent = updateSection(0, qnaPair1, qnaPair2);
    const res = qnaIndexer.parse(newContent);
    const qnaSections = res.qnaSections;
    expect(qnaSections.length).toBe(1);
    expect(qnaSections[0].Questions[0].content).toBe('Question2');
    expect(qnaSections[0].Answer).toBe('Answer2');
  });

  it('should remove QnA Section', () => {
    const content = qnaPair1 + '\n' + qnaPair2;
    const newContent = removeSection(0, content);
    const res = qnaIndexer.parse(newContent);
    const qnaSections = res.qnaSections;
    expect(qnaSections.length).toBe(1);
    expect(qnaSections[0].Questions[0].content).toBe('Question2');
    expect(qnaSections[0].Answer).toBe('Answer2');
  });

  it('should insert QnA Section at the beginning', () => {
    const newContent = insertSection(0, qnaPair1, qnaPair2);
    const res = qnaIndexer.parse(newContent);
    const qnaSections = res.qnaSections;
    expect(qnaSections.length).toBe(2);
    expect(qnaSections[0].Questions[0].content).toBe('Question2');
    expect(qnaSections[0].Answer).toBe('Answer2');
  });

  it('should add a new Question to QnA Sectionn', () => {
    const qnaSections = qnaIndexer.parse(qnaPair1).qnaSections;
    const newContent = addQuestion('Question2', qnaSections, 0);
    const newQnaSections = qnaIndexer.parse(newContent).qnaSections;
    expect(newQnaSections.length).toBe(1);
    expect(newQnaSections[0].Questions[0].content).toBe('Question1');
    expect(newQnaSections[0].Questions[1].content).toBe('Question2');
    expect(newQnaSections[0].Answer).toBe('Answer1');
  });

  it('should update Question to QnA Sectionn', () => {
    const qnaSections = qnaIndexer.parse(qnaPair1).qnaSections;
    const newContent = updateQuestion('Question2', 0, qnaSections, 0);
    const newQnaSections = qnaIndexer.parse(newContent).qnaSections;
    expect(newQnaSections.length).toBe(1);
    expect(newQnaSections[0].Questions.length).toBe(1);
    expect(newQnaSections[0].Questions[0].content).toBe('Question2');
    expect(newQnaSections[0].Answer).toBe('Answer1');
  });

  it('should update Answer to QnA Sectionn', () => {
    const qnaSections = qnaIndexer.parse(qnaPair1).qnaSections;
    const newContent = updateAnswer('Answer2', qnaSections, 0);
    const newQnaSections = qnaIndexer.parse(newContent).qnaSections;
    expect(newQnaSections.length).toBe(1);
    expect(newQnaSections[0].Questions.length).toBe(1);
    expect(newQnaSections[0].Questions[0].content).toBe('Question1');
    expect(newQnaSections[0].Answer).toBe('Answer2');
  });
});
