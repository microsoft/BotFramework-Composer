// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseTemplateBody, extractTemplateNameFromExpression } from '../../../src';

const normalTemplateBody = `- variation0
- variation1
- variation2
- variation3`;

const parsedNormalTemplateBody = [
  { kind: 'variation', value: 'variation0' },
  { kind: 'variation', value: 'variation1' },
  { kind: 'variation', value: 'variation2' },
  { kind: 'variation', value: 'variation3' },
];

const templateBody = `> comment 0
- variation1
- variation2
> comment 1
- variation3
- \`\`\` multiline
variation
- with dash
\\- and escaped dash
and normal text
> and this comment!
\\> and escaped comment
\`\`\`


> comment 2`;

const parsedTemplateBody = [
  { kind: 'comment', value: 'comment 0' },
  { kind: 'variation', value: 'variation1' },
  { kind: 'variation', value: 'variation2' },
  { kind: 'comment', value: 'comment 1' },
  { kind: 'variation', value: 'variation3' },
  {
    kind: 'variation',
    value: `\`\`\` multiline
variation
- with dash
\\- and escaped dash
and normal text
> and this comment!
\\> and escaped comment
\`\`\``,
  },
  { kind: 'newline', value: '' },
  { kind: 'newline', value: '' },
  { kind: 'comment', value: 'comment 2' },
];

const oneMultilineVariation = `- \`\`\` multiline
variation
- with dash
\\- and escaped dash
and normal text
> and this comment!
\\> and escaped comment
\`\`\``;

describe('lgStringUtils', () => {
  it('Should parse template body with normal variations', () => {
    const items = parseTemplateBody(normalTemplateBody);
    expect(items.length).toBe(4);
    expect(items).toEqual(parsedNormalTemplateBody);
  });

  it('Should parse template body with variations, multiline variations and comments', () => {
    const items = parseTemplateBody(templateBody);
    expect(items.length).toBe(9);
    expect(items).toEqual(parsedTemplateBody);
  });

  it('Should parse template body with one multiline variation', () => {
    const items = parseTemplateBody(oneMultilineVariation);
    expect(items.length).toBe(1);
    expect(items).toEqual([parsedTemplateBody[5]]);
  });

  it('Should return empty array for undefined template body', () => {
    const items = parseTemplateBody(undefined);
    expect(items.length).toBe(0);
    expect(items).toEqual([]);
  });

  it('extractTemplateNameFromExpression: Extracts template name from an LG expression', () => {
    const templateName = extractTemplateNameFromExpression('${templateName()}');
    expect(templateName).toEqual('templateName');
  });

  it('extractTemplateNameFromExpression: Extracts template name from an LG expression in json method', () => {
    const templateName = extractTemplateNameFromExpression('${json(templateName())}');
    expect(templateName).toEqual('templateName');
  });
});
