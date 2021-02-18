// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { TextModalityEditor } from '../modalityEditors/TextModalityEditor';
import { CommonModalityEditorProps, TextStructuredResponseItem } from '../types';

const noop = () => {};

const renderTextModalityEditor = ({
  response = { kind: 'Text', value: [], valueType: 'direct' },
  removeModalityDisabled = false,
  lgOption = { fileId: '', templateId: 'Activity' },
  lgTemplates = [],
  onTemplateChange = jest.fn(),
  onRemoveModality = jest.fn(),
  onRemoveTemplate = jest.fn(),
  onUpdateResponseTemplate = jest.fn(),
}: Partial<CommonModalityEditorProps & { response: TextStructuredResponseItem }>) => {
  return render(
    <TextModalityEditor
      lgOption={lgOption}
      lgTemplates={lgTemplates}
      removeModalityDisabled={removeModalityDisabled}
      response={response as TextStructuredResponseItem}
      telemetryClient={{ track: noop, pageView: noop }}
      onRemoveModality={onRemoveModality}
      onRemoveTemplate={onRemoveTemplate}
      onTemplateChange={onTemplateChange}
      onUpdateResponseTemplate={onUpdateResponseTemplate}
    />
  );
};

describe('TextModalityEditor', () => {
  it('should render the value if it is not a template reference', async () => {
    const { findByText } = renderTextModalityEditor({
      response: { kind: 'Text', value: ['hello world'], valueType: 'direct' } as TextStructuredResponseItem,
    });
    await findByText('hello world');
  });

  it('should render items from template if the value is a template reference', async () => {
    const { findByText, queryByText } = renderTextModalityEditor({
      lgTemplates: [{ name: 'Activity_text', body: '- variation1\n- variation2\n- variation3', parameters: [] }],
      response: { kind: 'Text', value: ['${Activity_text()}'], valueType: 'template' } as TextStructuredResponseItem,
    });

    await findByText('variation1');
    await findByText('variation2');
    await findByText('variation3');

    // Should not render template reference in editor
    const template = queryByText('${Activity_text()}');
    expect(template).toBeNull();
  });
});
