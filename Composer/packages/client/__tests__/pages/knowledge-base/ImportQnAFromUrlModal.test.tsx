// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import ImportQnAFromUrlModal from '../../../src/components/QnA/ImportQnAFromUrlModal';
import { renderWithRecoil } from '../../testUtils';

const handleSubmit = jest.fn();

const qnaFile = {
  id: 'a.source.en-us',
  content: '',
  imports: [],
  options: [],
  diagnostics: [],
  qnaSections: [],
  empty: true,
  resource: { Errors: [], Content: '', Sections: [] },
  isContentUnparsed: true,
};

describe('QnA page all up view', () => {
  it('should render QnA page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(
      <ImportQnAFromUrlModal qnaFile={qnaFile} onDismiss={() => {}} onSubmit={handleSubmit} />
    );
    const urlField = getByTestId('ImportNewUrlToOverwriteQnAFile');
    fireEvent.change(urlField, { target: { value: 'http://newUrl.pdf' } });
    const submitButton = getByText('Done');
    fireEvent.click(submitButton);
    expect(handleSubmit).toBeCalled();
  });
});
