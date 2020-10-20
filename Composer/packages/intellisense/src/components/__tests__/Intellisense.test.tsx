// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { CompletionItem } from 'vscode-languageserver-types';

import { Intellisense } from '../Intellisense';

jest.mock('../../hooks/useLanguageServer', () => ({
  useLanguageServer: (url, scopes, documentUri, textFieldValue): CompletionItem[] => {
    if (textFieldValue !== '' && 'completionItem'.startsWith(textFieldValue)) {
      return [{ label: 'completionItem', data: {} }];
    } else {
      return [];
    }
  },
}));

const IntellisenseFieldWrapper = (props) => {
  const { value } = props;

  return (
    <Intellisense
      focused={true}
      id={`intellisense`}
      scopes={[]}
      url={''}
      value={value}
      onBlur={props.onBlur}
      onChange={() => {}}
    >
      {({ textFieldValue, focused, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField }) => (
        <TextField
          {...props}
          focused={focused}
          id={''}
          value={textFieldValue}
          onBlur={undefined} // onBlur managed by Intellisense
          onChange={(newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

describe('<Intellisense />', () => {
  let textFieldValue = '';

  const { container, rerender } = render(<IntellisenseFieldWrapper value={textFieldValue} />);

  it('renders', async () => {
    expect(container).toBeDefined();
  });

  it('does not have any completion items when the textField is empty', async () => {
    await rerender(<IntellisenseFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeFalsy();
  });

  it('does have a completion item when a good example of text is entered', async () => {
    textFieldValue = 'compl';
    await rerender(<IntellisenseFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeTruthy();
  });

  it('does not have any completion items when a bad example of text is entered', async () => {
    textFieldValue = 'test';
    await rerender(<IntellisenseFieldWrapper value={textFieldValue} />);
    const input = await container.querySelector('input');
    expect(input?.value).toBe(textFieldValue);

    const hasCompletionItem = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'completionItem'
    );
    expect(hasCompletionItem).toBeFalsy();
  });
});
