// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { qnaIndexer } from '../src/qnaIndexer';

const { parse, index } = qnaIndexer;

const content1 = `> # QnA Definitions
### ? who is the ceo?
	\`\`\`
	You can change the default message if you use the QnAMakerDialog.
	See [this link](https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle) for details.
	\`\`\`


### ? How do I programmatically update my KB?
	\`\`\`
	You can use our REST apis to manage your KB.
	\#1. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa
	\`\`\`
`;
const content2 = `> # QnA pairs

> !# @qna.pair.source = onlineFile.pdf

<a id = "1"></a>

## ? With Windows 10

\`\`\`markdown
**With Windows 10**
\`\`\``;

describe('parse', () => {
  it('should parse QnA file', () => {
    const result1 = parse('a.qna', content1);
    expect(result1.diagnostics.length).toEqual(0);
    expect(result1.empty).toEqual(false);
    expect(result1.qnaSections.length).toEqual(2);

    const result2 = parse('a.qna', content2);
    expect(result2.diagnostics.length).toEqual(0);
    expect(result2.empty).toEqual(false);
    expect(result2.qnaSections.length).toEqual(1);
  });

  it('should parse QnA file with import', () => {
    const content = `[import](windows-guide.source.qna)
  [import](../common/aks.qna)
  `;

    const result = parse('a.qna', content);
    expect(result.imports.length).toEqual(2);
    expect(result.imports[0]).toEqual({
      id: 'windows-guide.source.qna',
      path: 'windows-guide.source.qna',
      description: 'import',
    });
    expect(result.imports[1]).toEqual({ id: 'aks.qna', path: '../common/aks.qna', description: 'import' });
    expect(result.empty).toEqual(false);
    expect(result.qnaSections.length).toEqual(0);
  });

  it('should parse QnA file with info options ', () => {
    const content = `> !# @source.urls = https://aka.ms/surface-pro-4-user-guide-EN.pdf
> !# @source.name = guide
> # QnA pairs
`;

    const result = parse('a.qna', content);
    expect(result.empty).toEqual(false);
  });
});

describe('index', () => {
  const file = {
    name: 'test.qna',
    relativePath: './test.qna',
    content: content1,
    path: '/',
  } as FileInfo;

  it('should index qna file', () => {
    const result = index([file])[0];
    expect(result.id).toEqual('test');
    expect(result.qnaSections.length).toEqual(2);
  });
});
