// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { AddLanguageModal, DeleteLanguageModal } from '../../../src/components/MultiLanguage';

const defaultLanguage = 'en-us';
const languages = ['en-us', 'zh-cn'];
const locale = 'zh-cn';
describe('<AddLanguageModal />', () => {
  it('should render the AddLanguageModal form, and do add language', () => {
    jest.useFakeTimers();
    const onSubmit = jest.fn(() => {});
    const onDismiss = jest.fn(() => {});
    const { getByText } = render(
      <AddLanguageModal
        isOpen
        defaultLanguage={defaultLanguage}
        languages={languages}
        locale={locale}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />
    );

    const engCheckBox = getByText('English (United States) - Original');
    expect(engCheckBox).toBeTruthy();

    const submitButton = getByText('Done');
    fireEvent.click(submitButton);
    expect(onSubmit).toBeCalled();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onDismiss).toBeCalled();
  });
});

describe('<DeleteLanguageModal />', () => {
  it('should render the DeleteLanguageModal form, and do add language', () => {
    jest.useFakeTimers();
    const onSubmit = jest.fn(() => {});
    const onDismiss = jest.fn(() => {});
    const { getByText } = render(
      <DeleteLanguageModal
        isOpen
        defaultLanguage={defaultLanguage}
        languages={languages}
        locale={locale}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />
    );

    const checkBox = getByText('Chinese (Simplified, China) - Current');
    expect(checkBox).toBeTruthy();

    const submitButton = getByText('Done');
    fireEvent.click(submitButton);
    expect(onSubmit).toBeCalled();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onDismiss).toBeCalled();
  });
});
