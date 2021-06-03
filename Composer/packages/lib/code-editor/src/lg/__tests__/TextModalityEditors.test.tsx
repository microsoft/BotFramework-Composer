// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { TextModalityEditor } from '../modalityEditors/TextModalityEditor';
import { TextStructuredResponseItem } from '../types';

const noop = () => {};

describe('TextModalityEditor', () => {
  it('should render the value if it is not a template reference', async () => {
    const { findByText } = render(
      <TextModalityEditor
        focusOnMount={false}
        lgOption={{ fileId: '', templateId: 'Activity' }}
        removeModalityDisabled={false}
        response={{ kind: 'Text', value: ['hello world'], valueType: 'direct' } as TextStructuredResponseItem}
        telemetryClient={{ track: noop, pageView: noop }}
        onRemoveModality={jest.fn()}
        onRemoveTemplate={jest.fn()}
        onTemplateChange={jest.fn()}
        onUpdateResponseTemplate={jest.fn()}
      />
    );

    await findByText('hello world');
  });

  it('should render items from template if the value is a template reference', async () => {
    const { findByText, queryByText } = render(
      <TextModalityEditor
        focusOnMount={false}
        lgOption={{ fileId: '', templateId: 'Activity' }}
        lgTemplates={[{ name: 'Activity_text', body: '- variation1\n- variation2\n- variation3', parameters: [] }]}
        removeModalityDisabled={false}
        response={{ kind: 'Text', value: ['${Activity_text()}'], valueType: 'template' } as TextStructuredResponseItem}
        telemetryClient={{ track: noop, pageView: noop }}
        onRemoveModality={jest.fn()}
        onRemoveTemplate={jest.fn()}
        onTemplateChange={jest.fn()}
        onUpdateResponseTemplate={jest.fn()}
      />
    );

    await findByText('variation1');
    await findByText('variation2');
    await findByText('variation3');

    // Should not render template reference in editor
    const template = queryByText('${Activity_text()}');
    expect(template).toBeNull();
  });
});
