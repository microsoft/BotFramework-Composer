// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { IntellisenseTextField } from '../IntellisenseTextField';
import * as dependency from '../../hooks/useLanguageServer';
import { CompletionItem } from 'vscode-languageserver-types';

const useLanguageServerMock = (
  url: string,
  scopes: string[],
  documentUri: string,
  textFieldValue: string,
  cursorPosition: number,
  projectId?: string
): CompletionItem[] => {
  if (textFieldValue !== '' && 'completionItem'.startsWith(textFieldValue)) {
    return [{ label: 'completionItem', data: {} }];
  } else {
    return [];
  }
};

const IntellisenseTextFieldWrapper = (props) => {
  const { value } = props;

  return (
    <IntellisenseTextField url="" scopes={['expressions']} id="" onChange={() => {}} value={value}>
      {(textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) => (
        <TextField
          value={textFieldValue}
          onChange={(_e, newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </IntellisenseTextField>
  );
};

describe('<IntellisenseTextField />', () => {
  let textFieldValue = '';

  dependency.useLanguageServer = useLanguageServerMock;
  const { container, rerender } = render(<IntellisenseTextFieldWrapper value={textFieldValue} />);

  it('renders', async () => {
    expect(container).toBeDefined();
  });

  it('does not have any completion items when the textField is empty', async () => {
    await rerender(<IntellisenseTextFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeFalsy();
  });

  it('does have a completion item when a good example of text is entered', async () => {
    textFieldValue = 'compl';
    await rerender(<IntellisenseTextFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeTruthy();
  });

  it('does not have any completion items when a bad example of text is entered', async () => {
    textFieldValue = 'test';
    await rerender(<IntellisenseTextFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeFalsy();
  });
});
